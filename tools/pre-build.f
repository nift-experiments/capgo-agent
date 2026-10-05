result := run("node", "tools/native-controllers.mjs")
if(result.exit_code != 0) { throw error("Native controller preparation failed. " + result.stderr, "user.native_prebuild") }
