import type { ComponentType } from "react";
import type { z, ZodTypeAny } from "zod";

export type BuilderBlockComponentProps<TProps> = {
  props: TProps;
  isSelected?: boolean;
  isEditor?: boolean;
};

export type BuilderBlockDefinition<
  TType extends string,
  TSchema extends ZodTypeAny,
> = {
  type: TType;
  label: string;
  description: string;
  component: ComponentType<BuilderBlockComponentProps<z.infer<TSchema>>>;
  defaultProps: z.infer<TSchema>;
  schema: TSchema;
};

