import { z } from "zod";

// Bounds keep untrusted documents (model output, binfile JSON) from carrying absurd values.
const MAX_COORDINATE = 1_000_000;
const MAX_LIST = 1000;

const coordinate = z.number().min(-MAX_COORDINATE).max(MAX_COORDINATE);
const length = z.number().min(0).max(MAX_COORDINATE);
const unit = z.number().min(0).max(1);
const count = z.int().min(1).max(MAX_LIST);

export const irId = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const label = z.string().max(256);
/** A design token name: dot-separated groups, no reference braces or control characters. */
export const tokenName = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[^{}\p{Cc}]+$/u);

/** sRGB colour as `#rrggbb`; opacity travels separately, as in Penpot. */
export const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const blendMode = z.enum([
  "normal",
  "darken",
  "multiply",
  "color-burn",
  "lighten",
  "screen",
  "color-dodge",
  "overlay",
  "soft-light",
  "hard-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]);

const point = z.strictObject({ x: coordinate, y: coordinate });
const gradientStops = z
  .array(z.strictObject({ color, opacity: unit.default(1), offset: unit }))
  .min(2)
  .max(32);

/** Gradient points are relative to the shape's box: (0, 0) top left, (1, 1) bottom right. */
export const paint = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("solid"), color, opacity: unit.default(1) }),
  z.strictObject({
    type: z.literal("linear-gradient"),
    start: point,
    end: point,
    stops: gradientStops,
    opacity: unit.default(1),
  }),
  z.strictObject({
    type: z.literal("radial-gradient"),
    start: point,
    end: point,
    /** Ellipse ratio: 1 is a circle. */
    width: length.default(1),
    stops: gradientStops,
    opacity: unit.default(1),
  }),
  z.strictObject({
    type: z.literal("image"),
    asset: irId,
    opacity: unit.default(1),
    keepAspectRatio: z.boolean().default(true),
  }),
]);

export const stroke = z.strictObject({
  paint,
  width: length,
  alignment: z.enum(["center", "inner", "outer"]).default("center"),
  style: z.enum(["solid", "dotted", "dashed"]).default("solid"),
});

const shadow = {
  offsetX: coordinate.default(0),
  offsetY: coordinate.default(0),
  blur: length.default(0),
  spread: coordinate.default(0),
  color,
  opacity: unit.default(1),
};

export const effect = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("drop-shadow"), ...shadow }),
  z.strictObject({ type: z.literal("inner-shadow"), ...shadow }),
  z.strictObject({ type: z.literal("layer-blur"), radius: length }),
  z.strictObject({ type: z.literal("background-blur"), radius: length }),
]);

const sides = z.strictObject({ top: length, right: length, bottom: length, left: length });
const noSides = { top: 0, right: 0, bottom: 0, left: 0 };

export const radius = z.strictObject({
  topLeft: length,
  topRight: length,
  bottomRight: length,
  bottomLeft: length,
});

export const constraints = z.strictObject({
  horizontal: z.enum(["left", "right", "leftright", "center", "scale"]),
  vertical: z.enum(["top", "bottom", "topbottom", "center", "scale"]),
});

/** How a child sits inside a flex or grid parent. */
export const layoutChild = z.strictObject({
  absolute: z.boolean().default(false),
  zIndex: z.int().min(-MAX_LIST).max(MAX_LIST).default(0),
  horizontalSizing: z.enum(["fix", "auto", "fill"]).default("fix"),
  verticalSizing: z.enum(["fix", "auto", "fill"]).default("fix"),
  alignSelf: z.enum(["auto", "start", "end", "center", "stretch"]).default("auto"),
  margin: sides.default(noSides),
  minWidth: length.optional(),
  maxWidth: length.optional(),
  minHeight: length.optional(),
  maxHeight: length.optional(),
  /** Grid placement, 1-based like CSS grid lines. */
  cell: z
    .strictObject({
      row: count,
      column: count,
      rowSpan: count.default(1),
      columnSpan: count.default(1),
      area: label.optional(),
    })
    .optional(),
});

const distribution = z.enum([
  "start",
  "center",
  "end",
  "space-between",
  "space-around",
  "space-evenly",
  "stretch",
]);
const alignment = z.enum(["start", "end", "center", "stretch"]);
const gaps = { rowGap: length.default(0), columnGap: length.default(0) };

export const flexLayout = z.strictObject({
  type: z.literal("flex"),
  direction: z.enum(["row", "row-reverse", "column", "column-reverse"]),
  wrap: z.boolean().default(false),
  ...gaps,
  padding: sides.default(noSides),
  justifyContent: distribution.default("start"),
  alignItems: alignment.default("start"),
  alignContent: distribution.default("start"),
});

export const track = z.strictObject({
  type: z.enum(["flex", "fixed", "percent", "auto"]),
  value: length.default(1),
});

export const gridLayout = z.strictObject({
  type: z.literal("grid"),
  rows: z.array(track).min(1).max(MAX_LIST),
  columns: z.array(track).min(1).max(MAX_LIST),
  ...gaps,
  padding: sides.default(noSides),
  justifyItems: alignment.default("start"),
  alignItems: alignment.default("start"),
  justifyContent: distribution.default("start"),
  alignContent: distribution.default("start"),
});

export const layout = z.discriminatedUnion("type", [flexLayout, gridLayout]);

export const textRun = z.strictObject({
  text: z.string().min(1).max(100_000),
  fontFamily: z.string().min(1).max(256),
  fontWeight: z.int().min(1).max(1000).default(400),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  fontSize: z.number().min(1).max(10_000),
  /** Multiple of the font size, as Penpot stores it. */
  lineHeight: z.number().min(0).max(100).default(1.2),
  letterSpacing: coordinate.default(0),
  textTransform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).default("none"),
  textDecoration: z.enum(["none", "underline", "line-through"]).default("none"),
  fills: z.array(paint).max(16).default([]),
});

/** SVG path data: commands and numbers only, so nothing else can ride along into an emitter. */
export const pathData = z
  .string()
  .max(1_000_000)
  .regex(/^[MmLlHhVvCcSsQqTtAaZz0-9eE.,+\-\s]*$/);

const nodeBase = {
  id: irId,
  name: label.default(""),
  hidden: z.boolean().default(false),
  /** Position relative to the parent node; the top-level nodes are relative to the page. */
  x: coordinate,
  y: coordinate,
  width: length,
  height: length,
  rotation: z.number().min(-360).max(360).default(0),
  opacity: unit.default(1),
  blendMode: blendMode.default("normal"),
  constraints: constraints.optional(),
  layoutChild: layoutChild.optional(),
  fills: z.array(paint).max(16).default([]),
  strokes: z.array(stroke).max(16).default([]),
  effects: z.array(effect).max(16).default([]),
  /** Token applied per property, e.g. `{ fill: "color.primary" }`; emitters write a reference instead of the literal. */
  tokens: z.record(z.string().regex(/^[A-Za-z]{1,64}$/), tokenName).default({}),
  /** Set when the node is an instance of a component in `IrDocument.components`. */
  component: irId.optional(),
};

const rect = z.strictObject({ ...nodeBase, kind: z.literal("rect"), radius: radius.optional() });
const ellipse = z.strictObject({ ...nodeBase, kind: z.literal("ellipse") });
const path = z.strictObject({
  ...nodeBase,
  kind: z.literal("path"),
  d: pathData,
  fillRule: z.enum(["nonzero", "evenodd"]).default("nonzero"),
});
const image = z.strictObject({
  ...nodeBase,
  kind: z.literal("image"),
  asset: irId,
  radius: radius.optional(),
});
const text = z.strictObject({
  ...nodeBase,
  kind: z.literal("text"),
  runs: z.array(textRun).min(1).max(MAX_LIST),
  align: z.enum(["left", "center", "right", "justify"]).default("left"),
  verticalAlign: z.enum(["top", "center", "bottom"]).default("top"),
  growType: z.enum(["fixed", "auto-width", "auto-height"]).default("fixed"),
});

const groupFields = z.strictObject({ ...nodeBase, kind: z.literal("group") });

const boardFields = z.strictObject({
  ...nodeBase,
  kind: z.literal("board"),
  clip: z.boolean().default(true),
  layout: layout.optional(),
  /** `auto` hugs the content of a flex or grid board. */
  sizing: z
    .strictObject({ horizontal: z.enum(["fix", "auto"]), vertical: z.enum(["fix", "auto"]) })
    .default({ horizontal: "fix", vertical: "fix" }),
  radius: radius.optional(),
});

type Leaf = typeof rect | typeof ellipse | typeof path | typeof text | typeof image;

// Written out by hand: TypeScript cannot infer a recursive schema's type from itself.
export type IrNode =
  | z.output<Leaf>
  | (z.output<typeof groupFields> & { children: IrNode[] })
  | (z.output<typeof boardFields> & { children: IrNode[] });
export type IrNodeInput =
  | z.input<Leaf>
  | (z.input<typeof groupFields> & { children?: IrNodeInput[] | undefined })
  | (z.input<typeof boardFields> & { children?: IrNodeInput[] | undefined });

const children = z
  .array(z.lazy((): z.ZodType<IrNode, IrNodeInput> => irNode))
  .max(MAX_LIST)
  .default([]);

export const irNode = z.discriminatedUnion("kind", [
  boardFields.extend({ children }),
  groupFields.extend({ children }),
  rect,
  ellipse,
  path,
  text,
  image,
]);

export const asset = z.strictObject({
  id: irId,
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]),
  width: length,
  height: length,
});

export const tokenType = z.enum([
  "borderRadius",
  "shadow",
  "color",
  "dimension",
  "fontFamilies",
  "fontSizes",
  "fontWeights",
  "letterSpacing",
  "number",
  "opacity",
  "rotation",
  "sizing",
  "spacing",
  "borderWidth",
  "textCase",
  "textDecoration",
  "typography",
]);

export const token = z.strictObject({
  name: tokenName,
  type: tokenType,
  /** The value as written, possibly referencing other tokens (`{color.base}`). */
  value: z.string().max(4096),
  /** The value with references resolved, when the source could resolve it. */
  resolved: z.string().max(4096).optional(),
  description: z.string().max(4096).default(""),
});

export const tokenSet = z.strictObject({
  name: z.string().min(1).max(256),
  active: z.boolean().default(true),
  tokens: z.array(token).max(10_000),
});

export const component = z.strictObject({
  id: irId,
  name: label,
  /** Library path, e.g. `Buttons / Primary`. */
  path: label.default(""),
  /** Variant property values, e.g. `{ state: "hover" }`. */
  variant: z.record(label, label).default({}),
});

export const irDocument = z.strictObject({
  version: z.literal(1),
  nodes: z.array(irNode).min(1).max(MAX_LIST),
  assets: z.array(asset).max(MAX_LIST).default([]),
  tokenSets: z.array(tokenSet).max(MAX_LIST).default([]),
  components: z.array(component).max(MAX_LIST).default([]),
});

export type IrDocument = z.infer<typeof irDocument>;
export type IrPaint = z.infer<typeof paint>;
export type IrLayout = z.infer<typeof layout>;
export type IrTextRun = z.infer<typeof textRun>;
