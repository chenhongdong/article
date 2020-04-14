import React, { Component } from 'react';
import Tab from '@/components/Tab';
import '@/common/global.less';

export default class Layout extends Component {
    render() {
        return (<React.Fragment>
            {this.props.children}
            <Tab />
        </React.Fragment>)
    }
}