"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type {
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
} from "@wangeditor/editor";

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
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function buildImageHtml(src: string, alt = "") {
  return `<img src="${src}" alt="${alt}" />`;
}

function buildVideoHtml(src: string) {
  return `<video src="${src}" controls="true"></video>`;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
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
            const dataUrl = await readFileAsDataUrl(file);
            insertFn(dataUrl, file.name, dataUrl);
          },
        },
        uploadVideo: {
          async customUpload(
            file: File,
            insertFn: (url: string, poster?: string) => void,
          ) {
            const dataUrl = await readFileAsDataUrl(file);
            insertFn(dataUrl, "");
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

              const dataUrl = await readFileAsDataUrl(file);
              const html = file.type.startsWith("image/")
                ? buildImageHtml(dataUrl, file.name)
                : buildVideoHtml(dataUrl);

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
    [],
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
