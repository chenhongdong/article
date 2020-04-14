import React, { Component } from 'react';
import './index.less';
import NavHeader from '@/components/NavHeader';
import { Redirect } from 'react-router-dom';

// detail是由路由渲染出来的话，会有三个属性 history location match
export default class Detail extends Component {

    state = {
        lesson: this.props.location.state || {}
    }

    componentDidMount() {
        const lesson = this.state.lesson;
        if (!lesson || lesson.title) {
            const id = this.props.match.params.id;
        }
    }

    render() {
        let {lesson} = this.state;
        
        return (
            lesson ? (<div className="lesson-detail">
                <NavHeader title="课程详情" />
                <img src={lesson.poster} />
                <p>{lesson.title}</p>
                <p>{lesson.price}</p>
            </div>) : <Redirect to="/" />
        )
    }
}