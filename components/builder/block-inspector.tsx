"use client";

import type { ReactNode } from "react";
import { uploadBrowserFile } from "@/lib/media/client";
import type { FeatureIcon } from "@/lib/builder/blocks/feature-list";
import { heroImagePresets } from "@/lib/builder/hero-media";
import type { BuilderPageSection } from "@/lib/builder/schema";

type BlockInspectorProps = {
  section: BuilderPageSection | undefined;
  onChange: (sectionId: string, nextSection: BuilderPageSection) => void;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
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

export function BlockInspector({ section, onChange }: BlockInspectorProps) {
  if (!section) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm leading-7 text-slate-500">
        请先在画布中选中一个模块，再在这里编辑它的内容。
      </aside>
    );
  }

  if (section.type === "hero") {
    const props = section.props;

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
          options={heroImagePresets.map((item) => ({
            value: item.src,
            label: item.label,
          }))}
          value={props.backgroundImageSrc}
        />
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">上传背景图</span>
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
            { value: "manual", label: "手动维护" },
            { value: "products", label: "产品中心" },
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
        <Field
          label="展示数量"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                showCount: Number(value || 3),
              }),
            )
          }
          value={String(props.showCount)}
        />
        <Field
          label="详情按钮文案"
          onChange={(value) =>
            onChange(section.id, replaceSectionProps(section, { ...props, ctaLabel: value }))
          }
          value={props.ctaLabel}
        />
        {props.sourceMode === "products" ? (
          <div className="rounded-lg border border-dashed border-indigo-300 bg-indigo-50 px-4 py-4 text-sm leading-7 text-indigo-950">
            当前模块会优先读取“产品中心”里已发布的产品内容。你仍然可以保留下面的手动卡片，作为暂无产品时的占位内容。
          </div>
        ) : null}
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 3}
              key={`${section.id}-service-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`服务项 ${index + 1}`}
            >
              <Field
                label="编号"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, tag: value }),
                    }),
                  )
                }
                value={item.tag}
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
                label="封面图地址"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, coverImage: value }),
                    }),
                  )
                }
                value={item.coverImage}
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
          label="新增服务项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    tag: `0${props.items.length + 1}`,
                    title: "新增服务",
                    description: "补充新的服务内容、产品模块或解决方案说明。",
                    slug: "",
                    coverImage: "/hero/technology-platform.svg",
                  },
                ],
              }),
            )
          }
        />
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
            { value: "newsroom", label: "新闻后台" },
            { value: "manual", label: "手动维护" },
          ]}
          value={props.sourceMode}
        />
        <Field
          label="展示数量"
          onChange={(value) =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                showCount: Number(value || 3),
              }),
            )
          }
          value={String(props.showCount)}
        />
        <div className="space-y-4">
          {props.items.map((item, index) => (
            <ItemCard
              canRemove={props.items.length > 1}
              key={`${section.id}-news-${index}`}
              onRemove={() =>
                onChange(
                  section.id,
                  replaceSectionProps(section, {
                    ...props,
                    items: removeArrayItem(props.items, index),
                  }),
                )
              }
              title={`资讯项 ${index + 1}`}
            >
              <Field
                label="分类"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, category: value }),
                    }),
                  )
                }
                value={item.category}
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
                label="日期"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, date: value }),
                    }),
                  )
                }
                value={item.date}
              />
              <Field
                label="详情 slug"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, { ...item, slug: value }),
                    }),
                  )
                }
                value={item.slug}
              />
              <Field
                label="封面图"
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        coverImage: value,
                      }),
                    }),
                  )
                }
                value={item.coverImage}
              />
              <Field
                label="摘要"
                multiline
                onChange={(value) =>
                  onChange(
                    section.id,
                    replaceSectionProps(section, {
                      ...props,
                      items: updateArrayItem(props.items, index, {
                        ...item,
                        summary: value,
                      }),
                    }),
                  )
                }
                value={item.summary}
              />
            </ItemCard>
          ))}
        </div>
        <AddButton
          label="新增资讯项"
          onClick={() =>
            onChange(
              section.id,
              replaceSectionProps(section, {
                ...props,
                items: [
                  ...props.items,
                  {
                    category: "最新动态",
                    title: "新增资讯标题",
                    date: "2026-03-29",
                    summary: "补充新的新闻、文章或观点内容。",
                    slug: "new-article",
                    coverImage: "/hero/news-media-wall.svg",
                  },
                ],
              }),
            )
          }
        />
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
