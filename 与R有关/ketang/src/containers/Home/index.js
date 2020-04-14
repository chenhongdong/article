import React, { Component } from 'react';
import HomeHeader from './components/HomeHeader';
import {connect} from 'react-redux';
import actions from '@/store/actions/home';
import HomeSwiper from './components/HomeSwiper';
import HomeLesson from './components/HomeLesson';
import './index.less';
import { loadMore, downRefresh } from '@/utils';

@connect(
    state => state.home,
    actions
)
export default class Home extends Component {

    componentDidMount() {
        console.log(actions);
        const {getLessons, getSliders, refreshLessons} = this.props;
        getSliders();
        getLessons();
        loadMore(this.mainContent, getLessons);
        downRefresh(this.mainContent, refreshLessons);
    }

    render() {
        const { category, changeCategory, sliders, lessons, refreshLessons } = this.props;
        return (<React.Fragment>
            <HomeHeader 
                category={category}
                changeCategory={changeCategory}
                refreshLessons={refreshLessons}
            />
            <div className="main-content" ref={ref => this.mainContent = ref}>
                <HomeSwiper sliders={sliders}/>
                <HomeLesson lessons={lessons}/>
            </div>
        </React.Fragment>)
    }
}

