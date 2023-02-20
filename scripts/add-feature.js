var shell = require("shelljs");
var fs = require("fs").promises;

/* note this script is written exclusively for the v2 plugin 
   as most work going forward is expected to be built on flex v2.x
*/

// defaulting to plugin v2 for just now
var { getPaths } = require("./select-plugin");
const { templateDirectory, featureDirectory, pluginSrc, pluginDir } = getPaths("v2");

var featureName;
var featureClassName;
var featureConfigName;
var newFeatureDirectory;

const featureSubstitutionFiles = [
  "flex-hooks/events/pluginsLoaded.ts",
  "index.ts",
  "README.md",
  "types/ServiceConfiguration.ts"
];

const referenceSubstitutions = [
  {
    path: `${pluginSrc}/flex-hooks/events/events.ts`,
    substitutions: [
      {
        find: "// add-feature-script: pluginsLoaded imports",
        replaceWith: `// add-feature-script: pluginsLoaded imports\nimport FEATURE_CLASS_NAMELoaded from "../../feature-library/FEATURE_NAME/flex-hooks/events/pluginsLoaded";`
      },
      {
        find: "// add-feature-script: add pluginsLoaded handlers above this line",
        replaceWith: `FEATURE_CLASS_NAMELoaded,\n    // add-feature-script: add pluginsLoaded handlers above this line`
      }
    ]
  },
  {
    path: `${pluginSrc}/types/manager/CustomServiceConfiguration.ts`,
    substitutions: [
      {
        find: "// add-feature-script: type imports",
        replaceWith: `// add-feature-script: type imports\nimport FEATURE_CLASS_NAMEConfig from "../../feature-library/FEATURE_NAME/types/ServiceConfiguration";`
      },
      {
        find: "// add-feature-script: add config definitions above this line",
        replaceWith: `FEATURE_CONFIG_NAME: FEATURE_CLASS_NAMEConfig;\n  // add-feature-script: add config definitions above this line`
      }
    ]
  }
];

const onlyValidCharacters = (str) => {
  return /^[0-9a-z-]+$/.test(str);
}

const startsWithAlpha = (str) => {
  return /^[a-z]+$/.test(str[0]);
}

const capitalizeFirstLetter = (str) => {
  return str[0].toUpperCase() + str.slice(1);
}

const validateInput = () => {
  if(process.argv[2] === undefined || process.argv[2] === "" ){
    shell.echo("A new feature name was not provided, please try again and provide a new feature name when you run the script.  For example...");
    shell.echo("");
    shell.echo("npm run add-feature my-new-feature-name");
    shell.echo("");
    return false;
  }
  
  if(!onlyValidCharacters(process.argv[2])){
    shell.echo("invalid characters detected in new name.  Only a-z (lowercase), 0-9, and hyphens are accepted");
    shell.echo("");
    return false;
  }
  
  if(!startsWithAlpha(process.argv[2])){
    shell.echo("feature name must begin with a letter");
    shell.echo("");
    return false;
  }
  
  if(pluginSrc === ""){
    shell.echo("something went wrong trying to detect the current plugin directory, abandoning");
    shell.echo("");
    return false;
  }
  
  return true;
}

const performSubstitutions = (input) => {
  return input.replace(/FEATURE_NAME/g, featureName)
  .replace(/FEATURE_CLASS_NAME/g, featureClassName)
  .replace(/FEATURE_CONFIG_NAME/g, featureConfigName);
}

// get feature name from argv
const setVars = () => {
  featureName = process.argv[2];
  
  // transform name
  featureClassName = capitalizeFirstLetter(featureName.replace(/-([a-z])/gi, function(s, group1) {
      return group1.toUpperCase();
  }));
  featureConfigName = featureName.replace(/-/g, '_');
  
  newFeatureDirectory = `${featureDirectory}/${featureName}`;
}

const createDir = async () => {
  try {
    await fs.access(newFeatureDirectory);
    // if this is successful, the feature directory already exists
    shell.echo("feature directory already exists, abandoning");
    shell.echo("");
    return false;
  } catch {
    shell.echo("Creating feature");
    shell.mkdir(newFeatureDirectory);
    shell.cp('-R', `${templateDirectory}/feature-template/.`, `${newFeatureDirectory}/`);
    return true;
  }
}

const updateNames = async () => {
  var success = true;
  
  await Promise.all(featureSubstitutionFiles.map(async (file) => {
    try {
      shell.echo(`Setting feature name in ${file}`);
      const fileData = await fs.readFile(`${newFeatureDirectory}/${file}`, "utf8");
      let newFileData = performSubstitutions(fileData);
      await fs.writeFile(`${newFeatureDirectory}/${file}`, newFileData, 'utf8');
    } catch (error) {
      shell.echo(`Failed to update ${file}: ${error}`);
      success = false;
    }
  }));
  
  return success;
}

// add references to base files
const updateRefs = async () => {
  var success = true;
  
  await Promise.all(referenceSubstitutions.map(async (reference) => {
    try {
      shell.echo(`Adding feature to ${reference.path}`);
      let fileData = await fs.readFile(reference.path, "utf8");
      for (const sub of reference.substitutions) {
        fileData = fileData.replace(sub.find, performSubstitutions(sub.replaceWith));
      }
      await fs.writeFile(reference.path, fileData, 'utf8');
    } catch (error) {
      shell.echo(`Failed to update ${reference.path}: ${error}`);
      success = false;
    }
  }));
  
  return success;
}

// update flex-config, used for deployment to Flex Configuration API
// default to disabled to allow for planned deployments
const updateConfig = async () => {
  let configFile = "flex-config/ui_attributes.common.json";
  try {
    shell.echo(`Adding feature to ${configFile}`);
    let fileData = await fs.readFile(configFile, "utf8");
    let jsonData = JSON.parse(fileData);
    jsonData.custom_data.features[featureConfigName] = { enabled: false };
    await fs.writeFile(configFile, JSON.stringify(jsonData, null, 2), 'utf8');
  } catch (error) {
    shell.echo(`Failed to update ${configFile}: ${error}`);
  }
}

// update appConfig, used for local development
// default this one to enabled to make developer's life easier
const updateAppConfig = async () => {
  var success = true;
  let appConfigFile = `${pluginDir}/public/appConfig.js`;
  try {
    await fs.access(appConfigFile);
    // if this is successful, the appConfig exists (yay!)
    shell.echo(`Adding feature to ${appConfigFile}`);
    let appConfigData = await fs.readFile(appConfigFile, "utf8");
    let newAppConfigData = appConfigData.replace("features: {", `features: {\n      ${featureConfigName}: {\n        enabled: true,\n      },`);
    await fs.writeFile(appConfigFile, newAppConfigData, 'utf8');
  } catch (error) {
    success = false;
  }
  
  return success;
}

const addFeature = async () => {
  if (!validateInput()) {
    return;
  }
  
  setVars();
  
  if (!(await createDir()) || !(await updateNames()) || !(await updateRefs())) {
    return;
  }
  
  await updateConfig();
  let appConfigUpdated = await updateAppConfig();
  
  shell.echo("");
  shell.echo(`Feature added: "${featureName}"`);
  if (appConfigUpdated) {
    shell.echo("Please note that this feature has been enabled locally for development. It will not be enabled elsewhere until it is added to flex-config for the appropriate environment.");
  } else {
    shell.echo("Please note that this feature will not be enabled until it is added to flex-config for the appropriate environment.");
  }
  shell.echo("");
}

addFeature();