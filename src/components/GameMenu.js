import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import Modal from './Modal';
import Keyboard from './Keyboard';
import { gameStates } from '../constants';
import githubLogo from '../assets/GitHub-Mark-64px.png';

const Title = styled.div`
  padding: 16px;
  text-align: center;
  font-size: 36px;
  color: white;
`;

const Item = styled.div`
  text-align: center;
  padding: 8px;
  cursor: pointer;
  font-size: 24px;
  color: white;

  :hover {
    background-color: #424242;
  }
`;

const Padding = styled.div`
  text-align: center;
  padding: 8px;
  color: white;
`;

const LinkItem = styled(Link)`
  display: block;
  text-align: center;
  text-decoration: none;
  padding: 8px;
  cursor: pointer;
  font-size: 24px;
  color: white;

  :hover {
    background-color: #424242;
  }
`;

const InputGroup = styled.div`
  padding 8px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  font-size: 24px;
  text-align: center;
  margin-bottom: 8px;
  padding: 8px 0;
  border: none;

  ${props =>
    props.error
      ? css`
          background-color: #ef9a9a;
          ::placeholder {
            color: white;
          }
        `
      : ''};
`;

const Loading = styled.div`
  text-align: center;
  color: white;
`;

const RankHeader = styled.div`
  display: flex;
  text-align: center;
  color: #9e9e9e;
  padding: 8px;
`;

const RankItem = LinkItem.extend`
  display: flex;
`;

const Rank = styled.div`
  width: 50px;
`;

const Name = styled.div`
  flex: 1;
  text-align: left;
  padding-left: 8px;
`;

const Score = styled.div`
  width: 50px;
  text-align: right;
`;

const Source = styled.a`
  position: absolute;
  right: 5px;
  bottom: 5px;
  height: 30px;
  line-height: 30px;
  color: white;
  text-decoration: none;
`;

const GithubLogo = styled.img`
  width: 30px;
  height: 30px;
  filter: invert(100%);
`;

class GameMenu extends Component {
  state = { name: '', error: false, canSubmit: false };

  componentWillReceiveProps(nextProps) {
    const { gameState, data, location: { pathname } } = nextProps;
    if (
      data &&
      this.props.location.pathname !== '/rank' &&
      pathname === '/rank'
    ) {
      data.refetch();
    }

    if (
      this.props.gameState !== gameStates.FINISHED &&
      gameState === gameStates.FINISHED
    ) {
      this.setState({
        canSubmit: true,
      });
    }
  }

  submit = () => {
    const { name, canSubmit } = this.state;
    if (!canSubmit) {
      return;
    }

    if (name === '') {
      this.setState({ error: true });
    } else {
      this.setState({ canSubmit: false });
      this.props.submit(name);
    }
  };

  handleNameChange = event => {
    this.setState({ name: event.target.value });
  };

  renderMainMenu = () => (
    <Modal width="50%">
      <Title>LUMINES</Title>
      <LinkItem to="/game">START</LinkItem>
      <LinkItem to="/rank">RANK</LinkItem>
      <Keyboard />
      <Source href="https://github.com/geniusgordon/react-lumines">
        open sourced in <GithubLogo src={githubLogo} />
      </Source>
    </Modal>
  );

  renderPausedMenu = () => {
    const { resume, quit, location: { pathname } } = this.props;
    return (
      <Modal>
        <Title>PAUSED</Title>
        <Item onClick={resume}>RESUME</Item>
        <LinkItem to={`/refresh${pathname}`}>RESTART</LinkItem>
        <Item onClick={quit}>QUIT</Item>
      </Modal>
    );
  };

  renderGameoverMenu = () => {
    const { quit, location: { pathname } } = this.props;
    return (
      <Modal>
        <Title>GAME OVER</Title>
        <LinkItem to={`/refresh${pathname}`}>RESTART</LinkItem>
        <Item onClick={quit}>QUIT</Item>
      </Modal>
    );
  };

  renderFinishedMenu = () => {
    const { score, quit, location: { pathname } } = this.props;
    const { name, error, canSubmit } = this.state;
    return (
      <Modal>
        <Title>Score: {score}</Title>
        {pathname === '/game' &&
          canSubmit && (
            <InputGroup>
              <Input
                value={name}
                error={error}
                placeholder="Enter Your Name"
                onChange={this.handleNameChange}
              />
              <Item onClick={this.submit}>Submit</Item>
            </InputGroup>
          )}
        <LinkItem to={`/refresh${pathname}`}>RESTART</LinkItem>
        <Item onClick={quit}>QUIT</Item>
      </Modal>
    );
  };

  renderRank = () => {
    const { quit, data } = this.props;
    return (
      <Modal>
        <RankHeader>
          <Rank>Rank</Rank>
          <Name>Name</Name>
          <Score>Score</Score>
        </RankHeader>
        {data.loading && <Loading>Loading</Loading>}
        {data &&
          data.allRanks.map((rank, index) => (
            <RankItem key={rank.id} to={`/replay/${rank.id}`}>
              <Rank>{index + 1}</Rank>
              <Name>{rank.name}</Name>
              <Score>{rank.score}</Score>
            </RankItem>
          ))}
        <Padding />
        <Item onClick={quit}>BACK</Item>
      </Modal>
    );
  };

  render() {
    const { gameState, location: { pathname } } = this.props;

    if (pathname === '/') {
      return this.renderMainMenu();
    }
    if (pathname === '/game' || pathname.startsWith('/replay')) {
      if (gameState === gameStates.PAUSED) {
        return this.renderPausedMenu();
      }
      if (gameState === gameStates.GAMEOVER) {
        return this.renderGameoverMenu();
      }
      if (gameState === gameStates.FINISHED) {
        return this.renderFinishedMenu();
      }
    }
    if (pathname === '/rank') {
      return this.renderRank();
    }
    return null;
  }
}

const TopRanksQuery = gql`
  query TopRanks {
    allRanks(orderBy: score_DESC, first: 10) {
      id
      name
      score
    }
  }
`;

export default compose(withRouter, graphql(TopRanksQuery))(GameMenu);
