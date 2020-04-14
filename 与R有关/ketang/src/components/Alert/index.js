import React, { Component } from 'react';
import './index.less';

export default class Alert extends Component {
    render() {
        return (<div className={`alert alert-${this.props.type}`}>
            {this.props.message}
        </div>)
    }
}