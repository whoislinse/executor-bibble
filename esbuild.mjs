import * as esbuild from "esbuild";

const watching = process.argv.includes("--watch");

const shared = {
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  external: ["vscode"],
};

const targets = [
  { entryPoints: ["client/src/extension.js"], outfile: "out/client/src/extension.js" },
  { entryPoints: ["server/src/server.js"], outfile: "out/server/src/server.js" },
  { entryPoints: ["server/src/library.js"], outfile: "out/server/src/library.js" },
];

if (watching) {
  const contexts = await Promise.all(targets.map(target => esbuild.context({ ...shared, ...target })));
  await Promise.all(contexts.map(context => context.watch()));
} else {
  for (const target of targets) {
    await esbuild.build({ ...shared, ...target });
  }
}
