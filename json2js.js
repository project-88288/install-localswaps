const glob = require("glob");
const fs = require("fs").promises;

// Find all JavaScript config files and convert them to JSON.
glob(
  "./assets/**/*.json",
  {
    ignore: ["index.js", "./node_modules/**"],
  },
  (_, files) => {
    files.forEach(async (file) => {
      const fullPath = `./${file}`;
      console.log(fullPath)
      // Append `on` to the end of `js` to create `json`.
      const fullPathJS = `./${file}`.replace('.json', '.js');
      console.log(fullPathJS)
      const jsonList = await fs.readFile(fullPath, 'utf8')

      // Format the JS object with indentions before writing.
      const jsList = JSON.parse(jsonList)

      const networks = ["mainnet", "classic", "testnet", "localterra"]
      // Sort lists based on protocol name, or contract name.
      networks.forEach((network) => {
        if (typeof jsList[network] === "undefined") {
          return;
        }

        jsList[network] = Object.entries(jsList[network])
          .sort(([_a, a], [_b, b]) => {
            if (typeof a.protocol !== "undefined") {
              return a.protocol.localeCompare(b.protocol);
            }

            if (typeof a.name !== "undefined") {
              return a.name.localeCompare(b.name);
            }

            return 0;
          })
          .reduce((obj, key) => {
            obj[key[0]] = jsList[network][key[0]];
            return obj;
          }, {});
      });

      console.log(jsList)

      await fs.writeFile(fullPathJS, `module.exports = ${JSON.stringify(jsList, null, 2)}`, 'utf8');
    });
  }
);