import { z } from "zod";
import { TeamMembersBlock } from "@/components/blocks/team-members-block";
import type { BuilderBlockDefinition } from "@/lib/builder/types";

export const teamMemberItemSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  bio: z.string().min(1),
  avatar: z.string().default(""),
});

export const teamMembersPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  items: z.array(teamMemberItemSchema).min(1),
});

export const teamMembersSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("team-members"),
  props: teamMembersPropsSchema,
});

export type TeamMemberItem = z.infer<typeof teamMemberItemSchema>;
export type TeamMembersProps = z.infer<typeof teamMembersPropsSchema>;
export type TeamMembersSection = z.infer<typeof teamMembersSectionSchema>;

export const teamMembersDefaultProps: TeamMembersProps = {
  title: "核心团队",
  description: "一群有经验、有判断力的人，持续把复杂问题变成清晰的解决方案。",
  items: [
    {
      name: "王磊",
      title: "创始人 & CEO",
      bio: "15年互联网产品与技术经验，主导过多个千万级用户产品的从0到1。",
      avatar: "",
    },
    {
      name: "林静",
      title: "设计总监",
      bio: "专注品牌视觉与用户体验设计，曾服务20+行业头部企业。",
      avatar: "",
    },
    {
      name: "赵鹏",
      title: "技术负责人",
      bio: "全栈工程师，深耕企业级前端工程与后端系统架构设计。",
      avatar: "",
    },
    {
      name: "陈雪",
      title: "客户成功负责人",
      bio: "负责项目交付与客户关系，确保每个合作都能达成预期目标。",
      avatar: "",
    },
  ],
};

export const teamMembersBlockDefinition: BuilderBlockDefinition<
  "team-members",
  typeof teamMembersPropsSchema
> = {
  type: "team-members",
  label: "团队成员",
  description: "展示核心团队成员与个人介绍的卡片网格模块。",
  component: TeamMembersBlock,
  defaultProps: teamMembersDefaultProps,
  schema: teamMembersPropsSchema,
};
