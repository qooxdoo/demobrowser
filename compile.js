function compile(data, callback) {
    let inWork = false;
    this.addListener("writtenApplications",  (e) => {
      if (inWork) {
        return;
      }
      inWork = true;
      const DataGenerator = require(path.join(process.cwd(), "tool/lib/DataGenerator"));
      const async = require("async");
      const name = "demobrowser";//e.getData();
      const output = data.target.outputPath;
      let target = this._getMaker().getTarget();
      let analyser = target.getAnalyser();

      // global vars
      const config = {
        demoPath: "source/demo/",
        demoDataJsonFile: path.join(output, name, "script/demodata.json"),
        classPath: "source/class",
        jsSourcePath: "source/class/demobrowser/demo",
        demoConfigJsonFile: path.join(output, name, "config.demo.json"),
        verbose: this.argv.verbose
      };
      let appInfos = [];
      let dataGenerator = new DataGenerator(config);
      async.series([
        // catches all the demos from config.demoPath
        dataGenerator.catchEntries.bind(dataGenerator),
        // Creates json file with all demos
        dataGenerator.createJsonDataFile.bind(dataGenerator),
        // copy all javascript files to config.scriptDestinationPath
        dataGenerator.copyJsFiles.bind(dataGenerator),
        (cb) => {
          console.info("\nget apps" );          
          let environment = {
            "qx.allowUrlVariants" : true,
            "qx.allowUrlSettings" : true,
            "qx.contrib": false,
            "qx.icontheme": ["Tango", "Oxygen"]
          };
          analyser.setEnvironmentCheck(environment);
          let files = dataGenerator.getFiles('.html');
          files.forEach(file => {
            if (file.level === 2) {
              let demoCategory = dataGenerator.getDemoCategoryFromFile(file.path);
              let className = 'demobrowser.demo.' +  demoCategory.category + '.' + demoCategory.name;
              let library = analyser.getLibraryFromClassname(className);
              if (!library) {
               console.info("no class found for " + file.path);
               return;
              }
              appInfos.push({
                app: new qx.tool.compiler.app.Application(className, [
                  "qx.theme.Indigo",
                  "qx.theme.Simple",
                  "qx.theme.Modern",
                  "qx.theme.Classic",
                  "qx.log.appender.Native",
                  "qx.log.appender.Console",
                  "qx.dev.ObjectSummary"
                ]).set({
                  theme: "qx.theme.Indigo",
                  analyser: analyser,
                  environment: environment,
                  name: className,
                  outputPath: path.join(name, "/script"),
                  writeIndexHtmlToRoot: false                  
                }),
                className: className
              });
            }
          });
          cb();
        },
        (cb) => {
           console.info("Writing " + target);          
           async.eachSeries(appInfos,
            (appInfo, cb) => {
             target.set({
                      scriptPrefix: appInfo.className + "-"
                      , targetUri: path.join(appInfo.app.getName(), "script")

              });
              debugger;
              if (data.target.type === "build") {
                target.setMinify("off");
              }
              // Calculate dependencies and write it out
              appInfo.app.setAnalyser(analyser);
              appInfo.app.calcDependencies();
              target.setAnalyser(analyser);
              if (this.argv.verbose) {
                console.info("Writing class " + appInfo.app.getClassName());
             }   
             target.generateApplication(appInfo.app,  appInfo.app.getEnvironment(), function(err) {
                if (err)
                  return cb(err);
                cb();
              });
            },
            cb)           
        },
        (cb) => {
          qx.tool.compiler.files.Utils.sync("source/demo", path.join(output, name, "demo"))
             .then(() => cb())
             .catch((err) => cb(err));
        }
      ]);
    });
    callback(null, data);

}