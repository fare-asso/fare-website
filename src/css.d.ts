// Ambient declaration so type-aware linting (oxlint typeCheck / tsgolint)
// accepts global CSS side-effect imports like `import "../globals.css"`.
// Next.js handles these at build time; this only satisfies the type layer.
declare module "*.css" {
    const content: { readonly [className: string]: string }
    export default content
}
