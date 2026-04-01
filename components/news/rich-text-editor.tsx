"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from "@wangeditor/editor";
import { uploadBrowserFile } from "@/lib/media/client";

const WangToolbar = dynamic(
  () => import("@wangeditor/editor-for-react").then((mod) => mod.Toolbar),
  { ssr: false },
);

const WangEditor = dynamic(
  () => import("@wangeditor/editor-for-react").then((mod) => mod.Editor),
  { ssr: false },
);

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  uploadFolder?: "news" | "products" | "site" | "blocks";
};

function buildImageHtml(src: string, alt = "") {
  return `<img src="${src}" alt="${alt}" />`;
}

function buildVideoHtml(src: string) {
  return `<video src="${src}" controls="true"></video>`;
}

export function RichTextEditor({
  value,
  onChange,
  uploadFolder = "news",
}: RichTextEditorProps) {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [editor]);

  const toolbarConfig = useMemo<Partial<IToolbarConfig>>(
    () => ({
      toolbarKeys: [
        "headerSelect",
        "bold",
        "italic",
        "underline",
        "through",
        "color",
        "bgColor",
        "bulletedList",
        "numberedList",
        "blockquote",
        "insertLink",
        "uploadImage",
        "insertImage",
        "uploadVideo",
        "insertVideo",
        "undo",
        "redo",
      ],
    }),
    [],
  );

  const editorConfig = useMemo<Partial<IEditorConfig>>(
    () => ({
      placeholder: "请输入新闻正文，支持上传或粘贴图片、视频。",
      MENU_CONF: {
        uploadImage: {
          async customUpload(
            file: File,
            insertFn: (url: string, alt?: string, href?: string) => void,
          ) {
            const url = await uploadBrowserFile(file, uploadFolder);
            insertFn(url, file.name, url);
          },
        },
        uploadVideo: {
          async customUpload(
            file: File,
            insertFn: (url: string, poster?: string) => void,
          ) {
            const url = await uploadBrowserFile(file, uploadFolder);
            insertFn(url, "");
          },
        },
      },
      customPaste(currentEditor, event) {
        const clipboard = event.clipboardData;

        if (!clipboard) {
          return false;
        }

        const mediaFiles = Array.from(clipboard.items).filter(
          (item) =>
            item.kind === "file" &&
            (item.type.startsWith("image/") || item.type.startsWith("video/")),
        );

        if (mediaFiles.length > 0) {
          event.preventDefault();

          void Promise.all(
            mediaFiles.map(async (item) => {
              const file = item.getAsFile();

              if (!file) {
                return;
              }

              const url = await uploadBrowserFile(file, uploadFolder);
              const html = file.type.startsWith("image/")
                ? buildImageHtml(url, file.name)
                : buildVideoHtml(url);

              currentEditor.dangerouslyInsertHtml(html);
            }),
          );

          return true;
        }

        const html = clipboard.getData("text/html");

        if (html && (html.includes("<img") || html.includes("<video") || html.includes("<source"))) {
          event.preventDefault();
          currentEditor.dangerouslyInsertHtml(html);
          return true;
        }

        return false;
      },
    }),
    [uploadFolder],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50">
        <WangToolbar
          defaultConfig={toolbarConfig}
          editor={editor}
          mode="default"
          style={{ border: "none", backgroundColor: "transparent" }}
        />
      </div>
      <WangEditor
        defaultConfig={editorConfig}
        mode="default"
        onChange={(currentEditor) => {
          onChange(currentEditor.getHtml());
        }}
        onCreated={(currentEditor) => {
          setEditor(currentEditor);
        }}
        style={{
          minHeight: "360px",
          backgroundColor: "#ffffff",
        }}
        value={value}
      />
    </div>
  );
}
