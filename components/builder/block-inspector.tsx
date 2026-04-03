/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, type ReactNode } from "react";
import { uploadBrowserFile } from "@/lib/media/client";
import { buildHeroBannerSelectOptions } from "@/lib/builder/banner-media";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageSizeHint } from "@/components/ui/image-size-hint";
import type { FeatureIcon } from "@/lib/builder/blocks/feature-list";
import type { BuilderPageSection } from "@/lib/builder/schema";

type BlockInspectorProps = {
  section: BuilderPageSection | undefined;
  onChange: (sectionId: string, nextSection: BuilderPageSection) => void;
  heroBannerSources?: string[];
  onHeroBannerUploaded?: (src: string) => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
};

type NumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

type SelectFieldProps = {
  label: string;
  value: string;
  options: ReadonlyArray<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
};

type SectionShellProps = {
  title: string;
  caption: string;
  children: ReactNode;
};

type ItemCardProps = {
  title: string;
  canRemove: boolean;
  onRemove: () => void;
  children: ReactNode;
};

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-700";

const featureIcons = [
  { value: "layers", label: "模块" },
  { value: "shield", label: "安全" },
  { value: "pulse", label: "研发" },
  { value: "spark", label: "增长" },
  { value: "globe", label: "全球" },
  { value: "chip", label: "技术" },
] as const;

function replaceSectionProps<T extends BuilderPageSection>(
  section: T,
  props: T["props"],
): T {
  return {
    ...section,
    props,
  };
}

function updateArrayItem<T>(items: T[], index: number, nextItem: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? nextItem : item));
}

function removeArrayItem<T>(items: T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function Field({ label, value, onChange, multiline = false }: FieldProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-slate-700 md:text-sm">{label}</span>
      {multiline ? (
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={inputClassName}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }: NumberFieldProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-slate-700 md:text-sm">{label}</span>
      <input
        className={inputClassName}
        max={max}
        min={min}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) {
            return;
          }
          onChange(parsed);
        }}
        step={1}
        type="number"
        value={value}
      />
    </label>
  );
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-medium text-slate-700 md:text-sm">{label}</span>
      <select
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionShell({ title, caption, children }: SectionShellProps) {
  return (
    <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{caption}</p>
        <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h3>
      </div>
      {children}
    </aside>
  );
}

function ItemCard({ title, canRemove, onRemove, children }: ItemCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <button
          className="text-xs font-medium text-rose-600 disabled:text-slate-300 md:text-sm"
          disabled={!canRemove}
          onClick={onRemove}
          type="button"
        >
          删除
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-900 transition hover:bg-indigo-100 md:text-sm"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function BlockInspector({
  section,
  onChange,
  heroBannerSources,
  onHeroBannerUploaded,
}: BlockInspectorProps) {
  const [bannerPickerOpen, setBannerPickerOpen] = useState(false);

  if (!section) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-7 text-slate-500">
        请先在画布中选中一个模块，再在这里编辑它的内容。
      </aside>
    );
  }

  if (section.type === "hero") {
    const props = section.props;
    const bannerOptions = buildHeroBannerSelectOptions([
      ...(heroBannerSources ?? []),
      props.backgroundImageSrc,
    ]);

    return (
      <SectionShell caption="模块属性" title="首屏横幅">
        <Field
          label="眉标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, eyebrow: value }))
          }
          value={props.eyebrow}
        />
        <Field
          label="主标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="副标题"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <SelectField
          label="背景图预设"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, { ...props, backgroundImageSrc: value }),
            )
          }
          options={bannerOptions}
          value={props.backgroundImageSrc}
        />
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">上传背景图</span>
          <ImageSizeHint guideKey="heroBanner" />
          <input
            accept="image/*"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-white"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              try {
                const url = await uploadBrowserFile(file, "blocks");
                onChange(
                  section.id,
                  replaceSectionProps(section, { ...props, backgroundImageSrc: url }),
                );
                onHeroBannerUploaded?.(url);
              } catch (error) {
                console.error("Failed to upload block asset", error);
              }
            }}
            type="file"
          />
        </label>
      </SectionShell>
    );
  }

  if (section.type === "banner-carousel") {
    const props = section.props;
    const maxSlides = 10;
    const sourceOptions = buildHeroBannerSelectOptions([
      ...(heroBannerSources ?? []),
      ...props.slides,
    ]);

    const addSlide = (src: string) => {
      if (props.slides.includes(src) || props.slides.length >= maxSlides) {
        return;
      }
      onChange(
        section.id,
        replaceSectionProps(section, {
          ...props,
          slides: [...props.slides, src].slice(0, maxSlides),
        }),
      );
    };

    const removeSlide = (src: string) => {
      if (props.slides.length <= 1) {
        return;
      }
      onChange(
        section.id,
        replaceSectionProps(section, {
          ...props,
          slides: props.slides.filter((item) => item !== src),
        }),
      );
    };

    const availableOptions = sourceOptions.filter((option) => !props.slides.includes(option.value));

    return (
      <SectionShell caption="模块属性" title="Banner 轮播">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <ImageSizeHint className="text-slate-500" guideKey="heroBanner" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-700 md:text-sm">当前轮播图片</span>
            <span className="text-xs text-slate-500">
              已选 {props.slides.length}/{maxSlides}
            </span>
          </div>
          <div className="grid gap-2">
            {props.slides.map((source) => (
              <div
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"
                key={source}
              >
                <img
                  alt="banner"
                  className="h-12 w-20 rounded-md border border-slate-200 object-cover"
                  src={source}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-700">{source}</p>
                </div>
                <button
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 disabled:opacity-40"
                  disabled={props.slides.length <= 1}
                  onClick={() => removeSlide(source)}
                  type="button"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
          <button
            className="w-full rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-900 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={props.slides.length >= maxSlides}
            onClick={() => setBannerPickerOpen(true)}
            type="button"
          >
            新增 Banner 图
          </button>
        </div>

        <Dialog onOpenChange={setBannerPickerOpen} open={bannerPickerOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>新增 Banner 图</DialogTitle>
              <DialogDescription>可从已有图片中选择，或上传新图（最多 10 张）。</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <ImageSizeHint guideKey="heroBanner" />
              <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
                上传新图
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file || props.slides.length >= maxSlides) {
                      return;
                    }

                    try {
                      const url = await uploadBrowserFile(file, "blocks");
                      addSlide(url);
                      onHeroBannerUploaded?.(url);
                      setBannerPickerOpen(false);
                    } catch (error) {
                      console.error("Failed to upload block asset", error);
                    } finally {
                      event.target.value = "";
                    }
                  }}
                  type="file"
                />
              </label>
            </div>

            <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200 p-2">
              {availableOptions.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">暂无可选图片</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableOptions.map((option) => (
                    <button
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                      key={option.value}
                      onClick={() => {
                        addSlide(option.value);
                        setBannerPickerOpen(false);
                      }}
                      type="button"
                    >
                      <img
                        alt="banner option"
                        className="h-14 w-24 rounded-md border border-slate-200 object-cover"
                        src={option.value}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-800">
                          {option.label}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">{option.value}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <NumberField
          label="轮播间隔（毫秒）"
          max={12000}
          min={1500}
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, intervalMs: value }))
          }
          value={props.intervalMs}
        />

        <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {(
            [
              { key: "autoPlay", label: "自动轮播", checked: props.autoPlay },
              { key: "showArrows", label: "显示左右箭头", checked: props.showArrows },
              { key: "showDots", label: "显示底部圆点", checked: props.showDots },
            ] as const
          ).map((item) => (
            <label className="flex items-center gap-2" key={item.key}>
              <input
                checked={item.checked}
                onChange={(event) => {
                  const checked = event.target.checked;
                  if (item.key === "autoPlay") {
                    onChange(
                      section.id,
                      replaceSectionProps(section, { ...props, autoPlay: checked }),
                    );
                    return;
                  }
                  if (item.key === "showArrows") {
                    onChange(
                      section.id,
                      replaceSectionProps(section, { ...props, showArrows: checked }),
                    );
                    return;
                  }
                  onChange(
                    section.id,
                    replaceSectionProps(section, { ...props, showDots: checked }),
                  );
                }}
                type="checkbox"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (section.type === "stats-strip") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="数据概览">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 3}
              key={`${section.id}-stats-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`数据项 ${index + 1}`}
            >
              <Field
                label="数据值"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, value }),
                    }),
                  )
                }
                value={item.value}
              />
              <Field
                label="说明"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, label: value }),
                    }),
                  )
                }
                value={item.label}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增数据项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [...props.items, { value: "100%", label: "新增指标" }],
              }),
            )
          }
        />
      </SectionShell>
    );
  }

  if (section.type === "feature-list") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="能力卡片">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={`${section.id}-feature-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`卡片 ${index + 1}`}
            >
              <SelectField
                label="图标"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        icon: value as FeatureIcon,
                      }),
                    }),
                  )
                }
                options={featureIcons}
                value={item.icon}
              />
              <Field
                label="标题"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, title: value }),
                    }),
                  )
                }
                value={item.title}
              />
              <Field
                label="描述"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        description: value,
                      }),
                    }),
                  )
                }
                value={item.description}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增能力卡片"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    icon: "spark",
                    title: "新增能力",
                    description: "补充新的企业能力、服务亮点或业务价值。",
                  },
                ],
              }),
            )
          }
        />
      </SectionShell>
    );
  }

  if (section.type === "service-grid") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="服务产品">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <SelectField
          label="内容来源"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                sourceMode: value as "manual" | "products",
              }),
            )
          }
          options={[
            { value: "products", label: "产品中心（推荐）" },
            { value: "manual", label: "手动列表（仅兼容）" },
          ]}
          value={props.sourceMode}
        />
        <SelectField
          label="展示样式"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                variant: value as "cards" | "split" | "compact",
              }),
            )
          }
          options={[
            { value: "cards", label: "卡片网格" },
            { value: "split", label: "图文交错" },
            { value: "compact", label: "紧凑列表" },
          ]}
          value={props.variant}
        />
        <NumberField
          label="展示数量"
          max={12}
          min={1}
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                showCount: value,
              }),
            )
          }
          value={props.showCount}
        />
        <Field
          label="详情按钮文案"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, ctaLabel: value }))
          }
          value={props.ctaLabel}
        />
        <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 text-sm leading-7 text-indigo-950">
          页面编辑只负责展示规则。产品条目的新增、删除、分类与正文维护，请在「内容中心 &gt; 产品中心」完成。
        </div>
      </SectionShell>
    );
  }

  if (section.type === "tech-highlights") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="技术研发">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 3}
              key={`${section.id}-tech-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`技术项 ${index + 1}`}
            >
              <Field
                label="指标"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, metric: value }),
                    }),
                  )
                }
                value={item.metric}
              />
              <Field
                label="标题"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, title: value }),
                    }),
                  )
                }
                value={item.title}
              />
              <Field
                label="描述"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        description: value,
                      }),
                    }),
                  )
                }
                value={item.description}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增技术项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    metric: "01",
                    title: "新增亮点",
                    description: "补充新的架构优势、研发机制或技术能力。",
                  },
                ],
              }),
            )
          }
        />
      </SectionShell>
    );
  }

  if (section.type === "news-list") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="新闻资讯">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <SelectField
          label="内容来源"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                sourceMode: value as "newsroom" | "manual",
              }),
            )
          }
          options={[
            { value: "newsroom", label: "资讯中心（推荐）" },
            { value: "manual", label: "手动列表（仅兼容）" },
          ]}
          value={props.sourceMode}
        />
        <NumberField
          label="展示数量"
          max={12}
          min={1}
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                showCount: value,
              }),
            )
          }
          value={props.showCount}
        />
        <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 text-sm leading-7 text-indigo-950">
          页面编辑只负责展示规则。资讯条目的新增、删除、分类与正文维护，请在「内容中心 &gt; 资讯中心」完成。
        </div>
      </SectionShell>
    );
  }

  if (section.type === "location-map") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="地图组件">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <SelectField
            label="地图平台"
            onChange={(value) =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  provider: value as "amap" | "baidu",
                }),
              )
            }
            options={[
              { value: "amap", label: "高德地图" },
              { value: "baidu", label: "百度地图" },
            ]}
            value={props.provider}
          />
          <SelectField
            label="展示布局"
            onChange={(value) =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  layout: value as "split" | "map-only",
                }),
              )
            }
            options={[
              { value: "split", label: "左地图 + 右信息" },
              { value: "map-only", label: "仅地图" },
            ]}
            value={props.layout}
          />
        </div>
        <Field
          label="公司名称"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, companyName: value }))
          }
          value={props.companyName}
        />
        <Field
          label="公司地址"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, address: value }))
          }
          value={props.address}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="联系电话"
            onChange={(value) =>
              onChange(section.id, replaceSectionProps(section, { ...props, phone: value }))
            }
            value={props.phone}
          />
          <Field
            label="联系邮箱"
            onChange={(value) =>
              onChange(section.id, replaceSectionProps(section, { ...props, email: value }))
            }
            value={props.email}
          />
        </div>
        <Field
          label="自定义地图链接（可选）"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, mapEmbedSrc: value }))
          }
          value={props.mapEmbedSrc}
        />
        <p className="text-xs leading-6 text-slate-500">
          为空时将根据地图平台与公司地址自动生成链接；如你已拿到高德/百度嵌入链接，可直接粘贴覆盖。
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <NumberField
            label="移动端高度（px）"
            max={680}
            min={220}
            onChange={(value) =>
              onChange(section.id, replaceSectionProps(section, { ...props, heightMobile: value }))
            }
            value={props.heightMobile}
          />
          <NumberField
            label="桌面高度（px）"
            max={880}
            min={320}
            onChange={(value) =>
              onChange(section.id, replaceSectionProps(section, { ...props, heightDesktop: value }))
            }
            value={props.heightDesktop}
          />
        </div>
      </SectionShell>
    );
  }

  if (section.type === "company-intro") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="企业介绍">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 2}
              key={`${section.id}-company-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`内容项 ${index + 1}`}
            >
              <Field
                label="标题"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, title: value }),
                    }),
                  )
                }
                value={item.title}
              />
              <Field
                label="描述"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        description: value,
                      }),
                    }),
                  )
                }
                value={item.description}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增介绍项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    title: "新增内容",
                    description: "补充企业价值观、发展历程或团队能力。",
                  },
                ],
              }),
            )
          }
        />
      </SectionShell>
    );
  }

  if (section.type === "contact-methods") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="联系入口">
        <Field
          label="模块标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="模块描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 3}
              key={`${section.id}-contact-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`联系项 ${index + 1}`}
            >
              <Field
                label="标签"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, label: value }),
                    }),
                  )
                }
                value={item.label}
              />
              <Field
                label="内容"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, value }),
                    }),
                  )
                }
                value={item.value}
              />
              <Field
                label="说明"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        detail: value,
                      }),
                    }),
                  )
                }
                value={item.detail}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增联系项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    label: "新增渠道",
                    value: "示例内容",
                    detail: "补充新的联系入口、地址信息或商务说明。",
                  },
                ],
              }),
            )
          }
        />
      </SectionShell>
    );
  }

  if (section.type === "cta") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="行动引导">
        <Field
          label="标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <Field
          label="按钮文案"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, buttonLabel: value }))
          }
          value={props.buttonLabel}
        />
        <Field
          label="按钮链接"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, buttonHref: value }))
          }
          value={props.buttonHref}
        />
      </SectionShell>
    );
  }

  if (section.type === "testimonials") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="客户评价">
        <Field
          label="标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">评价列表</p>
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={index}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`评价 ${index + 1}`}
            >
              <Field
                label="客户姓名"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, name: value }),
                    }),
                  )
                }
                value={item.name}
              />
              <Field
                label="职位"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, title: value }),
                    }),
                  )
                }
                value={item.title}
              />
              <Field
                label="公司"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, company: value }),
                    }),
                  )
                }
                value={item.company}
              />
              <Field
                label="评价内容"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, content: value }),
                    }),
                  )
                }
                value={item.content}
              />
            </ItemCard>
          ))}
          <AddButton
            label="添加评价"
            onClick={() =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  items: [
                    ...props.items,
                    { name: "客户姓名", title: "职位", company: "公司名称", content: "这是一段真实的客户评价内容。", avatar: "" },
                  ],
                }),
              )
            }
          />
        </div>
      </SectionShell>
    );
  }

  if (section.type === "faq") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="常见问题">
        <Field
          label="标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">问题列表</p>
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={index}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`问题 ${index + 1}`}
            >
              <Field
                label="问题"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, question: value }),
                    }),
                  )
                }
                value={item.question}
              />
              <Field
                label="回答"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, answer: value }),
                    }),
                  )
                }
                value={item.answer}
              />
            </ItemCard>
          ))}
          <AddButton
            label="添加问题"
            onClick={() =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  items: [
                    ...props.items,
                    { question: "新问题", answer: "对应的回答内容。" },
                  ],
                }),
              )
            }
          />
        </div>
      </SectionShell>
    );
  }

  if (section.type === "partners") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="合作伙伴">
        <Field
          label="标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">合作伙伴列表</p>
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={index}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`伙伴 ${index + 1}`}
            >
              <Field
                label="名称"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, name: value }),
                    }),
                  )
                }
                value={item.name}
              />
            </ItemCard>
          ))}
          <AddButton
            label="添加伙伴"
            onClick={() =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  items: [...props.items, { name: "新合作伙伴", logoText: "新合作伙伴" }],
                }),
              )
            }
          />
        </div>
      </SectionShell>
    );
  }

  if (section.type === "team-members") {
    const props = section.props;

    return (
      <SectionShell caption="模块属性" title="团队成员">
        <Field
          label="标题"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, title: value }))
          }
          value={props.title}
        />
        <Field
          label="描述"
          multiline
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, description: value }))
          }
          value={props.description}
        />
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">成员列表</p>
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={index}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`成员 ${index + 1}`}
            >
              <Field
                label="姓名"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, name: value }),
                    }),
                  )
                }
                value={item.name}
              />
              <Field
                label="职位"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, title: value }),
                    }),
                  )
                }
                value={item.title}
              />
              <Field
                label="简介"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, bio: value }),
                    }),
                  )
                }
                value={item.bio}
              />
            </ItemCard>
          ))}
          <AddButton
            label="添加成员"
            onClick={() =>
              onChange(
                section.id,
                replaceSectionProps(section, {
                  ...props,
                  items: [
                    ...props.items,
                    { name: "新成员", title: "职位", bio: "成员简介。", avatar: "" },
                  ],
                }),
              )
            }
          />
        </div>
      </SectionShell>
    );
  }

  return null;
}
