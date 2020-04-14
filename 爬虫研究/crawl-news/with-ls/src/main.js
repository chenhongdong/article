const url = 'https://news.so.com/hotnews';
import read from './read';
import write from './write';

(async () => {
    let hotnews = await read(url);

    await write(hotnews);
})();