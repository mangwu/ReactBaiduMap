import "./Taost.css";

function Taost(props) {
  if (props.searchTxt === "") {
    return null;
  }
  if (!props.taostResult.hasOwnProperty("length")) {
    return null;
  }
  const taost = props.taostResult;
  const list =
    taost.length > 0
      ? Array(taost.length)
          .fill(0)
          .map((_v, index) => {
            return (
              <div
                key={index}
                className={taost[index].uid ? "taost-item" : "taost-none"}
                onClick={(e) => props.onClick(index, e)}
              >
                <div className="item-name">{taost[index].name}</div>
                <div className="item-address">
                  地址：{taost[index].address || taost[index].tag}
                </div>
              </div>
            );
          })
      : null;
  const listEle = list ? <div className="taost-list">{list}</div> : null;
  return listEle;
}

export default Taost;
