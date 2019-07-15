import './css/index.css';
import * as citys from './data';
import { init, handle } from './js/handle';

// 初始化传入北京地铁数据，
// 后续根据当前位置去匹配对应地铁城市的数据
init({ data: citys.bj });
handle();

