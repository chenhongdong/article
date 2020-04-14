import React, { Component } from 'react';
import './index.less';
import ReactSwipe from 'react-swipe';

export default class HomeSwiper extends Component {
    state = { index: 0 }

    render() {
        let swipeOptions = {
            continuous: true,
            callback: (index) => {
                this.setState({index});
            }
        };

        const { sliders } = this.props;

        return (<div className="home-swipe">
            {
                sliders.length > 0 ? (
                    <ReactSwipe className="carousel" swipeOptions={swipeOptions}>
                        {
                            sliders.map((item, index) => (
                                <div key={index}>
                                    <img src={item} />
                                </div>
                            ))
                        }
                    </ReactSwipe>
                ) : null
            }
            <div className="dots">
                {
                    sliders.map((item, index) => (
                        <span key={index} className={`dot ${index === this.state.index ? 'active' : ''}`}></span>
                    ))
                }
            </div>
        </div>)
    }
}