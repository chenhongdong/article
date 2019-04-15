import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Comment extends Component {
    static propTypes = {
        comment: PropTypes.object.isRequired,
        onDeleteComment: PropTypes.func,
        index: PropTypes.number
    }

    constructor() {
        super();
        this.state = { timeString: '' };
    }

    _updateTime = () => {
        const { comment } = this.props;
        const duration = (+new Date() - comment.createAt) / 1000;

        this.setState({
            timeString: duration > 60 ? `${Math.round(duration / 60)} 分钟前` : `${Math.round(Math.max(duration, 1))} 秒前`
        });
    }

    handleDelete = () => {
        const { onDeleteComment, index } = this.props;
        if (onDeleteComment) {
            onDeleteComment(index);
        }
    }
    _getProcessedContent = (content) => {
        return content && content.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")        
                .replace(/`[\S\s]+?`/g, '<code>$1</code>');
    }

    // 生命周期

    componentWillMount() {
        this._updateTime();

        this._timer = setInterval(this._updateTime, 5000);
    }

    componentWillUnmount() {
        clearInterval(this._timer);
    }


    render() {
        const { comment } = this.props;

        return (
            <div className="comment">
                <div className="comment-user">
                    <span>{comment.username}：</span>
                </div>
                <p dangerouslySetInnerHTML={{
                    __html: this._getProcessedContent(comment.content)
                }}></p>
                <span className="comment-createdtime">{this.state.timeString}</span>
                <span className="comment-delete" onClick={this.handleDelete}>删除</span>
            </div>
        );
    }
};