import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CommentList from '../components/CommentList';
import { initComments, delComment } from '../reducers/comment';

class CommentListContainer extends Component {
    static propTypes = {
        comments: PropTypes.array,
        initComments: PropTypes.func,
        onDeleteComment: PropTypes.func
    }


    // 方法
    _loadComments = () => {
        let comments = localStorage.getItem('comments');
        comments = comments ? JSON.parse(comments) : [];
        // this.props.initComments是connect传进来的
        // 可以帮我们把数据初始化到 state 里去
        this.props.initComments(comments);
    }
    handelDelComment = (index) => {
        const { comments, onDeleteComment } = this.props;
        // 不能修改props，创建一个新的评论的数组
        console.log(comments);
        const newComments = [
            ...comments.slice(0, index),
            ...comments.slice(index + 1)
        ];
        // console.log(newComments)
        // 更新评论数据
        localStorage.setItem('comments', JSON.stringify(newComments));

        // 会dispatch一个 action去删除评论
        onDeleteComment && onDeleteComment(index);
    }

    // 生命周期
    componentWillMount() {
        // 在componentWillMount 生命周期中初始化评论
        this._loadComments();
    }

    render() {
        return (
            <CommentList 
                comments={this.props.comments}
                onDeleteComment={this.handelDelComment} />
        )
    }
}

// 评论数据从 state.comments 中获取
const mapStateToProps = (state) => {
    console.log(state);
    
    return {
        comments: state.comments
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        initComments: (comments) => {
            dispatch(initComments(comments));
        },
        onDeleteComment: (index) => {
            dispatch(delComment(index));
        }
    }
};


// 将CommentListContainer connect 到 store
// 会把comments, initComments, onDeleteComment 传给 CommentListContainer
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CommentListContainer);