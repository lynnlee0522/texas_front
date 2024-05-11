import { socket } from './components/socket';
import './App.css';
import { useEffect, useState } from 'react';
import { FindRooms } from './components/Rooms';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [inRoom, setInRoom] = useState(false);
  const [step, setStep] = useState('start');
  const [clientCard, setClientCard] = useState()
  const [cardTable, setCardTable] = useState();

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [])

  useEffect(() => {
    socket.on('licensing', getCardInfo);
    socket.on('licensingTable', getCardInfo);
    socket.on('turn', getCardInfo);
    socket.on('river', getCardInfo);

    return () => {
      socket.off('licensing', getCardInfo);
      socket.off('licensingTable', getCardInfo);
      socket.off('river', getCardInfo);
    };
  }, [])

  const getCardInfo = (cardInfo) => {
    const { step, clientCard, cardTable } = cardInfo
    step && setStep(step)
    clientCard && setClientCard(clientCard)
    cardTable && setCardTable(cardTable)
  }

  const onConnect = () => {
    setIsConnected(true);
  }

  const onDisconnect = () => {
    setIsConnected(false);
  }


  const connect = () => {
    socket.connect();
  }

  const disconnect = () => {
    socket.disconnect();
  }

  const joinRoom = () => {
    socket.emit('joinRoom', 'room1', (roomName) => {
      console.log(`您已经进入${roomName}`);
      setInRoom(true)
    });
  }

  const createRoom = () => {
    socket.emit('createRoom', 'room1', (roomName) => {
      console.log(`您已经进入${roomName}`);
      setInRoom(true)
    });
  }

  const init = () => {
    setStep('start')
    setCardTable([])
    setClientCard([])
  }

  const restart = () => {
    init();
    socket.emit('restart');
  }

  const handleLicensing = () => {
    socket.emit('licensing', 'room1');
  }

  const handleGetTable = () => {
    socket.emit('licensingTable');
  }

  const handleTurnCard = () => {
    socket.emit('turn');
  }

  const handleRiverCard = () => {
    socket.emit('river');
  }

  const renderCard = () => {
    const commonRender = <div>
      <div>洗牌完成!</div>
      <div>场面上的牌为: {(cardTable?.length ? cardTable : ['*', '*', '*'])?.map(item => {
        return `${item} `
      })} </div>
      <div>您手上的牌为: {clientCard?.map(item => {
        return `${item} `
      })} </div>
    </div>

    switch (step) {
      case 'start':
        return (
          <div>
            <button onClick={handleLicensing}>发牌</button>
          </div>
        )
      case 'licensing':
        return (
          <div>
            {commonRender}
            <button onClick={handleGetTable}>看牌</button>
          </div>
        )
      case 'licensingTable':
        return (
          <div>
            {commonRender}
            <button onClick={handleTurnCard}>发送转牌</button>
          </div>
        )
      case 'turn':
        return (
          <div>
            {commonRender}
            <button onClick={handleRiverCard}>发送河牌</button>
          </div>
        )
      case 'river':
        return (
          <div>
            {commonRender}
            <button onClick={restart}>再来一局</button>
          </div>
        )
      default:
        break;
    }

  }

  const renderRoom = () => {
    if (!isConnected) {
      return
    }

    if (!inRoom) {
      return (
        <>
          {/* <button onClick={joinRoom}>加入房间</button> */}
          <button onClick={createRoom}>创建房间</button>
          <FindRooms />
        </>
      )
    } else {
      return (
        <>
          {/* todo */}
          <button>退出房间</button>
          {renderCard()}
        </>
      )
    }
  }

  return (
    <div className="App">
      {
        !isConnected ? <button onClick={connect}>进入游戏</button> : <button onClick={disconnect}>退出游戏</button>
      }
      {
        renderRoom()
      }

    </div>
  );
}

export default App;
