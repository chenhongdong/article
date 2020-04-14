## 爬虫的基本流程

### 抓取数据

#### 获取全部标签
读取标签页然后返回一个包含所有标签的结果数组
```
// read/tags.js文件

const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:tags');


```
#### 读取文章列表和文章详情
从文章详情页里可以抓取到文章的内容和所对应的标签
```
// read/articles.js文件

```

#### 主文件调用读取方法

### 建立数据库存数据
#### 建表
- 标签表
- 文章表
- 文章标签关联表
- 用户表(订阅使用)
- 用户标签关联表(订阅使用)
#### 入库
通过write下的tags.js和articles.js文件分别实现写入标签和文章列表到数据库中

#### 打印日志方便查看

#### SQL语句
?表示占位符
这里顺便简单的说一下SQL语句里会用到的语法，无处不在的增删改查
1. 插入数据行
```
语法： 
    INSERT INTO 表名(列名) VALUES(列名值)
栗子：
    INSERT INTO tags(name,id,url) VALUES('爬虫',10,'https://news.so.com/hotnews')
解释：
    向标签表(tags)里插入一条，姓名，id和访问地址分别为VALUES内对应的值
```
2. 更新数据行
```
语法：
    UPDATE 表名 SET 列名=更新值 WHERE 更新条件
栗子：
    UPDATE articles SET title='你好，世界',content='世界没你想的那么糟！' WHERE id=1
解释：
    更新id为1的文章，标题和内容都进行了修改
```
3. 删除数据行
```
语法：
    DELETE FROM 表名 WHERE 删除条件
栗子：
    DELETE FROM tags WHERE id=11
解释：
    从标签表(tags)里删除id为11的数据
```
4. 查询
```
语法：
    SELECT 列名 FROM 表名 WHERE 查询条件 ORDER BY 排序列名
栗子：
    SELECT name,title,content FROM tags WHERE id=8
解释：
    查询id为8的标签表里对应信息
```


### 创建web服务

#### 首页

#### 详情页

#### 登录和订阅
中间件用来判断是否登录，检查登录checkLogin中间件