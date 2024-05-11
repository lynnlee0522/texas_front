import { socket } from "./components/socket";
import "./App.css";
import { useEffect, useState } from "react";
import { FindRooms } from "./components/Rooms";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [inRoom, setInRoom] = useState(false);
  const [step, setStep] = useState("start");
  const [clientCard, setClientCard] = useState();
  const [cardTable, setCardTable] = useState();
  const [roomName, setRoomName] = useState(btoa(+new Date()).slice(-6, -2));

  useEffect(() => {
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    socket.on("flop", getflopInfo);
    socket.on("flopTable", getCardInfo);
    socket.on("turn", getCardInfo);
    socket.on("river", getCardInfo);

    return () => {
      socket.off("flop", getflopInfo);
      socket.off("flopTable", getCardInfo);
      socket.off("river", getCardInfo);
    };
  }, []);

  const getflopInfo = (cardInfo) => {
    console.log("---here---", cardInfo);
    const { step, clientCard } = cardInfo;
    step && setStep(step);
    clientCard && setClientCard(clientCard);
    setCardTable(undefined);
  };

  const getCardInfo = (cardInfo) => {
    const { step, clientCard, cardTable } = cardInfo;
    step && setStep(step);
    clientCard && setClientCard(clientCard);
    cardTable && setCardTable(cardTable);
  };

  const onConnect = () => {
    console.log("---连接ws成功---");
    setIsConnected(true);
  };

  const onConnectError = (err) => {
    console.log("---连接失败---", err);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  const connect = () => {
    socket.connect();
  };

  const disconnect = () => {
    socket.disconnect();
  };

  const joinRoom = () => {
    socket.emit("joinRoom", roomName, (roomName) => {
      console.log(`您已经进入${roomName}`);
      setInRoom(true);
    });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", roomName, (roomName) => {
      console.log(`您已经离开${roomName}`);
      init();
      setInRoom(false);
    });
  };

  const createRoom = () => {
    socket.emit("createRoom", "room1", (roomName) => {
      console.log(`您已经进入${roomName}`);
      setInRoom(true);
    });
  };

  const init = () => {
    setStep("start");
    setCardTable([]);
    setClientCard([]);
  };

  const restart = () => {
    init();
    socket.emit("restart");
  };

  const handleFlop = () => {
    socket.emit("flop", roomName);
  };

  const handleGetTable = () => {
    socket.emit("flopTable");
  };

  const handleTurnCard = () => {
    socket.emit("turn");
  };

  const handleRiverCard = () => {
    socket.emit("river");
  };

  const renderCard = () => {
    const commonRender = (
      <div>
        <div>洗牌完成!</div>
        <div>
          场面上的牌为:{" "}
          {(cardTable?.length ? cardTable : ["*", "*", "*"])?.map((item) => {
            return `${item} `;
          })}{" "}
        </div>
        <div>
          您手上的牌为:{" "}
          {clientCard?.map((item) => {
            return `${item} `;
          })}{" "}
        </div>
      </div>
    );

    switch (step) {
      case "start":
        return (
          <div>
            <button onClick={handleFlop}>发牌</button>
          </div>
        );
      case "flop":
        return (
          <div>
            {commonRender}
            <button onClick={handleGetTable}>看牌</button>
          </div>
        );
      case "flopTable":
        return (
          <div>
            {commonRender}
            <button onClick={handleTurnCard}>发送转牌</button>
          </div>
        );
      case "turn":
        return (
          <div>
            {commonRender}
            <button onClick={handleRiverCard}>发送河牌</button>
          </div>
        );
      case "river":
        return (
          <div>
            {commonRender}
            <button onClick={restart}>再来一局</button>
          </div>
        );
      default:
        break;
    }
  };

  const renderRoom = () => {
    if (!isConnected) {
      return;
    }

    if (!inRoom) {
      return (
        <div>
          <label for="roomname">房间号</label>
          <input
            type="text"
            name="roomname"
            id="roomname"
            value={roomName}
            placeholder="input room name here"
            onChange={(e) => {
              setRoomName(e.target.value);
            }}
          />
          <button onClick={joinRoom}>创建或加入房间</button>
          {/* <button onClick={createRoom}>创建房间</button> */}
          {/* <FindRooms /> */}
        </div>
      );
    } else {
      return (
        <>
          {/* todo */}
          <button onClick={leaveRoom}>退出房间</button>
          {renderCard()}
        </>
      );
    }
  };

  return (
    <div className="App">
      {!isConnected ? (
        <button onClick={connect}>进入游戏</button>
      ) : inRoom ? (
        ""
      ) : (
        <button onClick={disconnect}>退出游戏</button>
      )}
      {renderRoom()}
    </div>
  );
}

export default App;
