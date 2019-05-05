import * as types from '../action-types';
import { getSliders, getLessons } from '@/api/home';

export default {
    changeCategory(category) {
        console.log('actiona', category);
        return { type: types.CHANGE_CATEGORY, payload: category };
    },
    getSliders() {
        // 依靠sage，返回一个函数，有两个参数,一个dispatch,一个getState
        return function (dispatch, getState) {
            getSliders().then(sliders => {
                dispatch({ type: types.SET_HOME_SLIDERS, payload: sliders });
            });
        }
    },
    getLessons() {
        return function (dispatch, getState) {
            const { category, lessons: { offset, limit, hasMore, loading } } = getState().home;

            if (hasMore && !loading) {
                dispatch({ type: types.SET_HOME_LESSONS_LOADING, payload: true });
                getLessons(category, offset, limit).then(lessons => {
                    dispatch({ type: types.SET_HOME_LESSONS, payload: lessons });
                });
            }
        }
    },
    refreshLessons() {
        return function (dispatch, getState) {
            const { category, lessons: { limit, loading } } = getState().home;

            if (!loading) {
                // 清空list loading=true
                dispatch({ type: types.RESET_HOME_LESSONS });

                getLessons(category, 0, limit).then(lessons => {
                    dispatch({ type: types.REFRESH_HOME_LESSONS, payload: lessons });
                });
            }
        }
    }
}