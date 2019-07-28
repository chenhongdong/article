const CronJob = require('cron').CronJob;
// 有两个参数 第一个是执行的时机  第二个是函数的定义
/* 
    *   秒  0-59
    *   分  0-59
    *   时  0-23
    *   日  1-31
    *   月  0-11
    *  星期  0-6  
*/

// * 代表任意值
// 特定值   用逗号,分割，如1,5,10放在秒位，会在时间为01秒,05秒和10秒的时候打印log值
// 范围值   用-横线分割，如10-30在该区间内
// 间隔时间  用/表示频率，如每隔5秒一次：*/5
let job = new CronJob('*/5 * * * * *', function() {
    console.log(new Date().toLocaleString());
});
job.start();