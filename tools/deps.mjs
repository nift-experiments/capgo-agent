// Historical importer helper; ordinary Agent builds do not import MDX.
export const load = specifier => import(specifier);
