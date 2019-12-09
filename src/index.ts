#!/usr/bin/env node

import program from 'commander';
import inquirer from 'inquirer';
import shell from 'shelljs';

// json
import configJson from "./config.json";

// const
import { mainList } from "./const/main-list.const";
import { subList } from "./const/sub-list.const";


/**
 * cli 設定
 *
 */
program
  .version('0.0.1')
  .description(' command-line-tips 快速查選指令小工具')
  .option('-i, --info', 'about the tool')
  .option('-c, --config', '顯示目前設定擋');

program.parse(process.argv);

/**
 * 大類詢問選項
 */
const mainPrompt = [{
  type: 'list',
  message: '請選擇分類:',
  name: 'main',
  choices: mainList
}];

/**
 * 小類詢問選項
 */
const subPrompt = [{
  type: 'list',
  message: '請選擇指令:',
  name: 'sub',
  choices: []
}];

/**
 * 選擇大類
 *
 */
const selectMain = (): void => {

  inquirer
    .prompt(mainPrompt)
    .then((answers: { main: string }) => {
      selectSub(answers.main);
    });

};

/**
 * 選擇小類
 *
 * @param {*} main - 大類
 */
const selectSub = (main): void => {

  setSubChoices(main);

  inquirer
    .prompt(subPrompt)
    .then((answers: { sub: string }) => {

      if (getSubProperty(main, answers.sub, 'count') === 0) {

        const script = getSubProperty(main, answers.sub, 'scripts')[0]
        shell.exec(script);

      } else {

        const count = getSubProperty(main, answers.sub, 'count') as number;
        const scripts = getSubProperty(main, answers.sub, 'scripts') as string[];
        const descriptions = getSubProperty(main, answers.sub, 'descriptions') as string[];

        getScript(
          count,
          scripts,
          descriptions
        ).then(
          (script: string) => shell.exec(script)
        );

      }

    });

};

/**
 * 設定小類類項目
 *
 * @param {MAIN} main
 */
const setSubChoices = (main: string) => {

  subPrompt[0].choices = subList
    .filter(item => item.main === main)
    .map(item => item.subList)[0]
    .map((item,index) => {
      item['value'] = index;
      return item;
    });

};

/**
 * 獲取小類某個屬性
 *
 * @param {string} main - 大類
 * @param {string} index - 哪一個
 * @param {string} key - 屬性k
 * @returns {(number | string | string[])}
 */
const getSubProperty = (main: string, index: string, key: string): number | string | string[] => {

  return configJson
    .filter(item => item.main === main)[0].subList
    .filter(item => item['value'] === index)[0][key]

}

/**
 * 獲取輸入後組合的script
 *
 * @param {number} count - 參數數量 
 * @param {string[]} scripts - 要組合的script
 * @param {string[]} descriptions - 輸入參數的描述
 * @returns {Promise<string>}
 */
const getScript = (count: number, scripts: string[], descriptions: string[]): Promise<string> => {

  return new Promise(resolve => {

    let script = '';
    let params = [];

    const inputParam = (i) => {

      return inquirer
        .prompt({
          type: "input",
          name: "param",
          message: descriptions[i]
        })

    }

    const processArray = async () => {

      for (let i = 0; i < count; i++) {

        await inputParam(i)
          .then((answers: { param: string }) => {
            params.push(answers.param);
          });

      }

      scripts.forEach((word, index) => {

        if (count > index) {
          script += word + params[index];
        } else {
          script += word;
        }

      });

      resolve(script);

    }

    processArray();

  })

}

if (program.info) {
  console.log('                                                         ');
  console.log('                                       / ￣￣￣￣￣＼      ');
  console.log('                                      |  多睡3分鐘  |     ');
  console.log('                                      ＼　　　　　 /     ');
  console.log('                                       ￣￣￣∨￣￣￣      ');
  console.log('                                                 ・     ');
  console.log('    _______          #,        ,#      　　 ∧ ∧ .・　    ');
  console.log('    |      |╲        ##,    ,##        |￣( ´Д｀)￣|     ');
  console.log('    |      |_╲         ###  ###        |＼⌒⌒⌒⌒⌒⌒⌒⌒⌒＼    ');
  console.log('    | ~~~~~~~ |  +      ####        =  | ＼⌒⌒⌒⌒⌒⌒⌒⌒⌒＼   ');
  console.log('    | ~~~~~~~ |     /##### #####/       ＼＼⌒⌒⌒⌒⌒⌒⌒⌒⌒＼  ');
  console.log('    | ~~~~~~~ |     #   #   #   #        ＼＼⌒⌒⌒⌒⌒⌒⌒⌒⌒|  ');
  console.log('    |_________|      ###    ###           ＼|＿＿＿＿＿|  ');
  console.log('                                                        ');
} else if (program.config) {
  console.log(JSON.stringify(configJson));
} else {
  selectMain();
}