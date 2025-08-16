# Update Qweb to the latest version

To update Qweb to the latest version, follow these steps:

1. Clone the latest version of Qweb from GitHub:

   ```bash
   git clone https://github.com/qweb-project/qweb.git
   ```

2. Navigate to the project directory.

3. Check for changes in the configuration files. If the `sample.config.toml` file contains new fields, delete your existing `config.toml` file, rename `sample.config.toml` to `config.toml`, and update the configuration accordingly.
4. After populating the configuration run `npm i`.
5. Install the dependencies and then execute `npm run build`.
6. Finally, start the app by running `npm run start`

---
