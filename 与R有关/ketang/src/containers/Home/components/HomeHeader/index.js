import React, { Component } from 'react';
import './index.less';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

export default class HomeHeader extends Component {
    state = {
        munuShow: false
    }

    changeCategory = (event) => {
        const category = event.target.dataset.category;
        this.props.changeCategory(category);
        this.setState({ menuShow: false }, () => {
            this.props.refreshLessons();
        });
    }

    render() {
        let { menuShow } = this.state;
        const { category } = this.props;

        return (<div className="home-header">
            <div className="home-logo">
                <img src="https://p.ssl.qhimg.com/t0184e4ce3cb83220c1.png" />
                <div onClick={() => this.setState({ menuShow: !menuShow })}>
                    {
                        menuShow ? <i className="iconfont icon-guanbi"></i> : <i className="iconfont icon-uilist"></i>
                    }
                </div>
            </div>
            <TransitionGroup>
                {
                    menuShow && (
                        <CSSTransition timeout={500} classNames="fade">
                            <ul className="home-menus" onClick={this.changeCategory}>
                                <li data-category="react" className={category === 'react' ? 'active' : ''}>React</li>
                                <li data-category="vue" className={category === 'vue' ? 'active' : ''}>Vue</li>
                            </ul>
                        </CSSTransition>
                    )
                }
            </TransitionGroup>
        </div>)
    }
}