import "./App.css";
import L from "leaflet";
import { useEffect, useState, useCallback } from "react";
// 引入 proj4.js 和 proj4leaflet.js
import "proj4/dist/proj4-src.js";
import "proj4leaflet/src/proj4leaflet";
import axios from "axios";
import Taost from "./Taost";
import location from "./assets/location.png";

L.CRS.Baidu = new L.Proj.CRS(
  "EPSG:900913",
  "+proj=merc +a=6378206 +b=6356584.314245179 +lat_ts=0.0 +lon_0=0.0 +x_0=0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
  {
    resolutions: (function () {
      const level = 19;
      var res = [];
      res[0] = Math.pow(2, 18);
      for (var i = 1; i < level; i++) {
        res[i] = Math.pow(2, 18 - i);
      }
      return res;
    })(),
    origin: [0, 0],
    bounds: L.bounds([20037508.342789244, 0], [0, 20037508.342789244]),
  }
);

function App() {
  const [latlng, setlatlng] = useState([[39.915, 116.404]]);
  const [map, setMap] = useState({});
  const [txt, setTxt] = useState("");
  const [taostResult, setTaostResult] = useState([]);
  const [addresses, setAddresses] = useState([
    {
      address: "武汉市洪山区光谷E城E3栋",
      city: "武汉市",
    },
    {
      address: "湖北省武汉市武昌区珞珈山路16号(八一路299号)",
      city: "武汉市",
    },
  ]);
  const getSuggestion = useCallback((query) => {
    axios
      .get(
        `/api/place/v2/suggestion?query=${query}&region=武汉&city_limit=true&output=json&ak=bX9wgOcBmf0OnXCoLAxZ8kqzbIDEhvXo`
      )
      .then((response) => {
        console.log(response);
        setTaostResult(response.data.result || []);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const getLocation = (address, city) => {
    city = city || "武汉市";
    axios
      .get(
        `/api/geocoding/v3/?address=${address}&city=${city}&output=json&ak=bX9wgOcBmf0OnXCoLAxZ8kqzbIDEhvXo&callback=showLocation`
      )
      .then((response) => {
        const data = response.data;
        const first = data.indexOf("(") + 1;
        const last = data.lastIndexOf(")");
        const sliceData = data.slice(first, last);
        const objData = JSON.parse(sliceData);
        console.log(objData);
        const ll = [objData.result.location.lat, objData.result.location.lng];
        setlatlng((latlng) => {
          console.log(latlng.concat([ll]));
          return latlng.concat([ll]);
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const searchTxt = useCallback((e) => {
    e.preventDefault();
    if (taostResult.length > 0) {
      const ll = [
        taostResult[0].location.lat,
        taostResult[0].location.lng,
      ];
      setTxt("");
      setlatlng((latlng) => {
        return latlng.concat([ll])
      })
    }
    
  }, [taostResult]);
  const handleSearchBarChange = (e) => {
    const query = e.target.value;
    setTxt(e.target.value);
    getSuggestion(query);
  };
  const handleAddressClick = (index, _e) => {
    const ll = [
      taostResult[index].location.lat,
      taostResult[index].location.lng,
    ];
    setTxt("");
    setlatlng((latlng) => {
      return latlng.concat([ll])
    })
  };
  const initMap = useCallback(() => {
    //注意将map的crs赋值 crs: L.CRS.Baidu
    const map = L.map("map", {
      crs: L.CRS.Baidu,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
      center: latlng[0],
      zoom: 15,
      layers: [
        new L.TileLayer(
          "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=ph&scaler=1&p=1",
          {
            name: "百度地图",
            subdomains: "0123456789",
            tms: true,
          }
        ),
      ],
    });
    setMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addMarker = useCallback(() => {
    const l = latlng[latlng.length - 1];
    // baidumap.setZoom(14);
    map.setView(l);
    // 标记
    let iconOption = {
      iconUrl: location,
      iconSize: [30, 30],
    };
    let customIcon = L.icon(iconOption);
    let markerOptions = {
      title: "武汉",
      clcikable: true,
      draggable: true,
      icon: customIcon,
    };
    let marker = L.marker(l, markerOptions);
    const win = `
     <h2>武汉研发中心</h2>
     <p><strong>建筑名称</strong><br/>武汉研发中心</p>
     <p><strong>层次结构</strong><br/>Global>武汉>软件园>武汉研发中心</p>
     <p><strong>地址</strong><br/>武汉市洪山区光谷E城E3栋</p>
     <p><strong>地理位置</strong><br/>纬度:${l[0]}&nbsp;<br/>经度:${l[1]}</p>
    `;
    // 添加弹窗
    marker.bindPopup(win).openPopup();
    marker.addTo(map);
  }, [latlng, map]);
  useEffect(() => {
    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    getLocation(addresses[0].address);
    getLocation(addresses[1].address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);
  useEffect(() => {
    if (map.setView) {
      addMarker();
    }
  }, [map, latlng, addMarker]);

  return (
    <div className="baidumap">
      <div className="search-bar">
        <form onSubmit={searchTxt}>
          <input
            type="text"
            value={txt}
            onChange={handleSearchBarChange}
            className="search-txt"
          />
          <input type="submit" value="检索" className="search-submit" />
          <Taost searchTxt = {txt} taostResult={taostResult} onClick={handleAddressClick} />
        </form>
      </div>
      <div id="map" style={{ height: 900 }}></div>;
    </div>
  );
}

export default App;
