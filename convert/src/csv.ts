import debug from 'debug';
import xlsx from 'xlsx';
import fs from 'fs';
import type ModusResult from '@oada/types/modus/v1/modus-result.js';
//import ModusResult, { ModusResult, is as isModusResult } from '@oada/types/modus/v1/modus-result.js';

const error = debug('@modusjs/convert#csv:error');
const warn = debug('@modusjs/convert#csv:error');
const info = debug('@modusjs/convert:info');
const trace = debug('@modusjs/convert:trace');


async function parse(path: string) {
  let data = fs.readFileSync(path)
  let wbook = xlsx.read(data);

  if (wbook.SheetNames.length < 0) {
    throw new Error(`Input contained no sheets`);
  }

  let first = wbook.SheetNames[0];

  if (first === undefined) {
    throw new Error(`First sheet name undefined`);
  }

  let sheet = wbook.Sheets[first];

  if (sheet === undefined) {
    throw new Error(`First sheet undefined`);
  }
  let rows = xlsx.utils.sheet_to_json(sheet);

  // Start to build the modus output
  let output: ModusResult = {
    Events : [{
      EventMetaData: {
        EventCode: "",
        EventDate: "",
        EventType: { Soil: true}
      },
      LabMetaData: {},
      FMISMetaData: {},
      EventSamples: {
        Soil: {
          //@ts-ignore
          DepthRefs: {},
          SoilSamples: []
        }
      }
    }]
  };

  //@ts-ignore
  output.Events[0].EventSamples.Soil.DepthRefs = rows.map((obj:any) => ({
    StartingDepth: obj["B Depth"],
    EndingDepth: obj["E Depth"],
    ColumnDepth: obj["E Depth"] - obj["B Depth"],
    DepthUnit: "in" //????Not documented in the example
  }))
  .filter((v: any, i: number, s: any[]) => s.indexOf(v) === i)
  .sort((a, b) => a.StartingDepth > b.StartingDepth ? 1 : -1)
  .map((v, i) => ({
    ...v,
    DepthID: i,
    Name: `Depth-${i}`
  }))

  //@ts-ignore
  let minDate = new Date(Math.min(rows.map(obj => new Date(obj['Date Recd']))));

  rows.forEach((row: any, i) => {
  //@ts-ignore
    output.Events[0]!.EventSamples.Soil.SoilSamples.push({
      SampleMetaData: {
        SampleNumber: i.toString(),
        ReportID: row["Sample ID"],
        NutrientResults: [{
          Element: "pH",
          Value: row["1:1 Soil pH"],
          ValueUnit: "none"
        }, {
          Element: "OM",
          Value: row["Organic Matter LOI %"],
          ValueUnit: "%"
        }, {
          Element: "P",
          Value: row["Olsen P ppm P"],
          ValueUnit: "ppm"
        }, {
          Element: "K",
          Value: row["Potassium ppm K"],
          ValueUnit: "ppm"
        }, {
          Element: "Ca",
          Value: row["Calcium ppm Ca"],
          ValueUnit: "ppm"
        }, {
          Element: "Mg",
          Value: row["Magnesium ppm Mg"],
          ValueUnit: "ppm"
        }, {
          Element: "CEC",
          Value: row["CEC/Sum of Cations me/100g"],
          ValueUnit: "Sum of Cations me/100g",     //TODO
        }, {
          Element: "BS-Ca",
          Value: row["%Ca Sat"],
          ValueUnit: "%"
        }, {
          Element: "BS-Mg",
          Value: row["%Mg Sat"],
          ValueUnit: "%"
        }, {
          Element: "BS-K",
          Value: row["%K Sat"],
          ValueUnit: "%"
        }, {
          Element: "BS-Na",
          Value: row["%Na Sat"],
          ValueUnit: "%"
        }, {
          Element: "BS-H",
          Value: row["%H Sat"],
          ValueUnit: "%"
        }, {
          Element: "SO4-S",
          Value: row["Sulfate-S ppm S"],
          ValueUnit: "ppm"
        }, {
          Element: "Zn",
          Value: row["Zinc ppm Zn"],
          ValueUnit: "ppm"
        }, {
          Element: "Mn",
          Value: row["Manganese ppm Mn"],
          ValueUnit: "ppm"
        }, {
          Element: "B",
          Value: row["Boron ppm B"],
          ValueUnit: "none"
        }, {
          Element: "Fe",
          Value: row["Iron ppm Mg"],
          ValueUnit: "ppm"
        }, {
          Element: "Cu",
          Value: row["Copper ppm Mg"],
          ValueUnit: "ppm"
        }, {
          Element: "Lime Rec",
          Value: row["Excess Lime"],
          ValueUnit: "none" //TODO
        }, {
          Element: "BpH",
          Value: row["WRDF Buffer pH"],
          ValueUnit: "none"
        }, {
          Element: "SS",
          Value: row["1:1 S Salts mmho/cm"],
          ValueUnit: "mmho/cm"
        }, {
          Element: "NO3-N",
          Value: row["Nitrate-N ppm N"],
          ValueUnit: "ppm"
        }, {
          Element: "P",
          Value: row["Bray P-1 ppm P"],
          ValueUnit: "ppm"
        }, {
          Element: "Na",
          Value: row["Sodium ppm Na"],
          ValueUnit: "ppm"
        }, {
          Element: "Al",
          Value: row["Aluminium ppm Na"],
          ValueUnit: "ppm"
        }, {
          Element: "Cl",
          Value: row["Chloride ppm Na"],
          ValueUnit: "ppm"
        }, {
          Element: "TN",
          Value: row["Total N ppm"],
          ValueUnit: "ppm"
        }, {
          Element: "TP",
          Value: row["Total P ppm"],
          ValueUnit: "ppm"
        }, {
          Element: "Sand",
          Value: row["% Sand"],
          ValueUnit: "%"
        }, {
          Element: "Silt",
          Value: row["% Silt"],
          ValueUnit: "%"
        }, {
          Element: "Clay",
          Value: row["% Clay"],
          ValueUnit: "%"
        }, {
          Element: "Texture",
          Value: row["Texture"],
          ValueUnit: "none"
        }]
      }
    })

  })
}