'use strict';

let React = require('react');
let Pager = require('./Pager');
let Options = require('./Options');
let KEYCODE = require('./KeyCode');


function noop() {
}

class Pagination extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      current: props.current,
      _current: props.current,
      pageSize: props.pageSize
    };

    [
      'render',
      '_handleChange',
      '_handleKeyUp',
      '_handleKeyDown',
      '_changePageSize',
      '_isValid',
      '_prev',
      '_next',
      '_hasPrev',
      '_hasNext',
      '_jumpPrev',
      '_jumpNext',
      '_canJumpPrev',
      '_canJumpNext'
    ].forEach((method) => this[method] = this[method].bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if ('current' in nextProps) {
      this.setState({
        current: nextProps.current
      });
    }

    if ('pageSize' in nextProps) {
      this.setState({
        pageSize: nextProps.pageSize
      });
    }
  }

  render() {
    let props = this.props;

    let prefixCls = props.prefixCls;
    let allPages = this._calcPage();
    let pagerList = [];
    let jumpPrev = null;
    let jumpNext = null;

    if (props.simple) {
      return (
        <ul className={`${prefixCls} ${prefixCls}-simple ${props.className}`}>
          <li title="Previous Page" onClick={this._prev} className={(this._hasPrev() ? '' : `${prefixCls}-disabled `) + `${prefixCls}-prev`}>
            <a></a>
          </li>
          <div title={`Page ${this.state.current} of ${allPages}`} className={`${prefixCls}-simple-pager`}>
            <input type="text" value={this.state._current} onKeyDown={this._handleKeyDown} onKeyUp={this._handleKeyUp} onChange={this._handleKeyUp} />
            <span className={`${prefixCls}-slash`}>／</span>
            {allPages}
          </div>
          <li title="Next Page" onClick={this._next} className={(this._hasNext() ? '' : `${prefixCls}-disabled `) + `${prefixCls}-next`}>
            <a></a>
          </li>
        </ul>
      );
    }

    if (allPages <= 9) {
      for (let i = 1; i <= allPages; i++) {
        let active = this.state.current === i;
        pagerList.push(<Pager rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, i)} key={i} page={i} active={active} />);
      }
    } else {
      jumpPrev = <li title="Previous 5 Page" key="prev" onClick={this._jumpPrev} className={`${prefixCls}-jump-prev`}>
        <a></a>
      </li>;
      jumpNext = <li title="Next 5 Page" key="next" onClick={this._jumpNext} className={`${prefixCls}-jump-next`}>
        <a></a>
      </li>;

      let current = this.state.current;

      // TODO: need optimization
      if (current <= 5) {
        // do not show first •••
        for (let i = 1; i <= 5; i++) {
          let active = current === i;
          pagerList.push(<Pager rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, i)} key={i} page={i} active={active} />);
        }
        pagerList.push(jumpNext);
        pagerList.push(<Pager last={true} rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, allPages)} key={allPages} page={allPages} active={false} />);
      } else if (allPages - current < 5) {
        // do not show last •••
        pagerList.push(<Pager rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, 1)} key={1} page={1} active={false} />);
        pagerList.push(jumpPrev);
        for (let i = allPages - 4; i <= allPages; i++) {
          let active = current === i;
          pagerList.push(<Pager last={i === allPages} rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, i)} key={i} page={i} active={active} />);
        }
      } else {
        // show both •••
        pagerList.push(<Pager rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, 1)} key={1} page={1} active={false} />);
        pagerList.push(jumpPrev);
        for (let i = current - 2; i <= current + 2; i++) {
          let active = current === i;
          pagerList.push(<Pager rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, i)} key={i} page={i} active={active} />);
        }
        pagerList.push(jumpNext);
        pagerList.push(<Pager last={true} rootPrefixCls={prefixCls} onClick={this._handleChange.bind(this, allPages)} key={allPages} page={allPages} active={false} />);
      }

    }

    return (
      <ul className={`${prefixCls} ${props.className}`}
        unselectable="unselectable">
        <li title="Previous Page" onClick={this._prev} className={(this._hasPrev() ? '' : `${prefixCls}-disabled `) + `${prefixCls}-prev`}>
          <a></a>
        </li>
        {pagerList}
        <li title="Next Page" onClick={this._next} className={(this._hasNext() ? '' : `${prefixCls}-disabled `) + `${prefixCls}-next`}>
          <a></a>
        </li>
        <Options rootPrefixCls={prefixCls}
          selectComponentClass={props.selectComponentClass}
          selectPrefixCls={props.selectPrefixCls}
          changeSize={this.props.showSizeChanger ? this._changePageSize.bind(this) : null}
          current={this.state.current}
          quickGo={this.props.showQuickJumper ? this._handleChange.bind(this) : null} />
      </ul>
    );
  }

  // private methods

  _calcPage() {
    return Math.floor((this.props.total - 1) / this.state.pageSize) + 1;
  }

  _isValid(page) {
    return typeof page === 'number' && page >= 1 && page <= this._calcPage() && page !== this.state.current;
  }

  _handleKeyDown(evt) {
    if (evt.keyCode === KEYCODE.ARROW_UP || evt.keyCode === KEYCODE.ARROW_DOWN) {
      evt.preventDefault();
    }
  }

  _handleKeyUp(evt) {
    let _val = evt.target.value;
    let val;

    if (_val === '') {
      val = _val;
    } else if (isNaN(Number(_val))) {
      val = this.state._current;
    } else {
      val = Number(_val);
    }

    this.setState({
      _current: val
    });

    if (evt.keyCode === KEYCODE.ENTER) {
      this._handleChange(val);
    } else if (evt.keyCode === KEYCODE.ARROW_UP) {
      this._handleChange(val - 1);
    } else if (evt.keyCode === KEYCODE.ARROW_DOWN) {
      this._handleChange(val + 1);
    }
  }

  _changePageSize(size) {
    if (typeof size === 'number') {
      this.setState({
        pageSize: size
      });
    }
  }

  _handleChange(page) {
    if (this._isValid(page)) {
      this.setState({
        current: page,
        _current: page
      });
      this.props.onChange(page);
    }
  }

  _prev() {
    if (this._hasPrev()) {
      this._handleChange(this.state.current - 1);
    }
  }

  _next() {
    if (this._hasNext()) {
      this._handleChange(this.state.current + 1);
    }
  }

  _jumpPrev() {
    if (this._canJumpPrev()) {
      this._handleChange(this.state.current - 5);
    }
  }

  _jumpNext() {
    if (this._canJumpNext()) {
      this._handleChange(this.state.current + 5);
    }
  }

  _hasPrev() {
    return this.state.current > 1;
  }

  _hasNext() {
    return this.state.current < this._calcPage();
  }

  _canJumpPrev() {
    return this.state.current > 5;
  }

  _canJumpNext() {
    return this._calcPage() - this.state.current > 5;
  }
}

Pagination.propTypes = {
  current: React.PropTypes.number,
  total: React.PropTypes.number,
  pageSize: React.PropTypes.number,
  onChange: React.PropTypes.func,
  showSizeChanger: React.PropTypes.bool,
  selectComponentClass:React.PropTypes.func,
  showQuickJumper: React.PropTypes.bool
};

Pagination.defaultProps = {
  current: 1,
  total: 0,
  pageSize: 10,
  onChange: noop,
  className: '',
  selectPrefixCls: 'rc-select',
  prefixCls: 'rc-pagination',
  selectComponentClass:null,
  showQuickJumper: false,
  showSizeChanger: false
};

module.exports = Pagination;
