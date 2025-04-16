"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[685],{6685:(e,t,o)=>{o.r(t),o.d(t,{default:()=>x});var r=o(5155),n=o(2115),a=o(5411),l=o.n(a),i=o(524);let s={"3D-Topo":"mapbox://styles/andy6309/cm91e8vke00j901s409p0fn1u","3D-Satellite":"mapbox://styles/andy6309/cm91ep7zp00jc01s4cnzuan6u","2D-Satellite":"mapbox://styles/andy6309/cm91dg5v400cg01sb7l517cjv","2D-Topo":"mapbox://styles/andy6309/cm91cu31800j101s4bxku2m6i"};var d=o(1018),c=o.n(d);function p(e,t,o){if(t.current)for(;t.current.firstChild;)t.current.removeChild(t.current.firstChild);let r=new(c())({accessToken:l().accessToken,mapboxgl:l(),marker:!1,placeholder:"Search locations..."});t.current&&t.current.appendChild(r.onAdd(e)),r.on("result",t=>{let r=t.result.geometry.coordinates;e.flyTo({center:r,zoom:17,bearing:0,speed:1.2,curve:1,essential:!0}),o.current&&(o.current.remove(),o.current=null);let n=new(l()).Marker({color:"#FF0000",scale:1.2,draggable:!1});n.setLngLat(r).addTo(e),o.current=n,setTimeout(()=>{o.current&&(o.current.remove(),o.current=null)},5e3)})}o(7219);let u=e=>{let{mapBearing:t,mapPitch:o,resetNorthAndTilt:n}=e;return(0,r.jsx)("div",{style:{position:"absolute",top:"250px",right:"10px",zIndex:2,opacity:0===t&&0===o?.6:1,transition:"opacity 0.3s ease"},children:(0,r.jsxs)("button",{onClick:n,style:{backgroundColor:"black",border:"1px solid #ddd",borderRadius:"50%",width:"60px",height:"60px",padding:"8px",cursor:"pointer",boxShadow:"0 0 0 3px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",transform:"rotate(".concat(t,"deg)"),position:"relative",outline:"none"},"aria-label":"Reset North and Tilt",children:[(0,r.jsx)("div",{style:{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid #007bff",position:"absolute",top:0,left:0}}),(0,r.jsx)("div",{style:{position:"absolute",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderBottom:"10px solid white",top:"6px",left:"50%",transform:"translateX(-50%)"}}),(0,r.jsx)("div",{style:{position:"absolute",width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:"10px solid gray",bottom:"6px",left:"50%",transform:"translateX(-50%)"}}),(0,r.jsx)("div",{style:{position:"absolute",top:"50%",left:"82%",transform:"translate(-50%, -50%)",width:"8px",height:"2px",backgroundColor:"gray"}}),(0,r.jsx)("div",{style:{position:"absolute",top:"50%",left:"18%",transform:"translate(-50%, -50%)",width:"8px",height:"2px",backgroundColor:"gray"}}),(0,r.jsx)("div",{style:{position:"absolute",fontSize:"14px",fontWeight:"bold",color:"white",width:"100%",top:"50%",transform:"translateY(-50%)",textAlign:"center"},children:"N"})]})})},g=e=>{let{draw:t,map:o}=e,n=e=>{o&&t&&("trash"===e?t.trash():t.changeMode(e))},a={backgroundColor:"white",border:"1px solid #007bff",borderRadius:"4px",padding:"8px",marginBottom:"5px",cursor:"pointer",width:"100%",display:"block",color:"#007bff",transition:"all 0.3s ease-in-out"},l={...a,border:"1px solid #dc3545",color:"#dc3545"};return(0,r.jsxs)("div",{style:{position:"absolute",top:"10px",right:"10px",zIndex:2,backgroundColor:"rgba(255, 255, 255, 0.7)",borderRadius:"5px",padding:"5px",boxShadow:"0 4px 6px rgba(0, 0, 0, 0.1)"},children:[(0,r.jsx)("div",{style:{marginBottom:"5px",fontWeight:"bold",textAlign:"center",color:"black"},children:"Drawing Tools"}),[{label:"Waypoint",mode:"draw_point"},{label:"Line",mode:"draw_line_string"},{label:"Shape",mode:"draw_polygon"}].map(e=>{let{label:t,mode:o}=e;return(0,r.jsx)("button",{onClick:()=>n(o),style:a,onMouseEnter:e=>{e.target.style.backgroundColor="#007bff",e.target.style.color="white"},onMouseLeave:e=>{e.target.style.backgroundColor="white",e.target.style.color="#007bff"},title:"Add ".concat(t),children:t},o)}),(0,r.jsx)("button",{onClick:()=>n("trash"),style:l,onMouseEnter:e=>{e.target.style.backgroundColor="#dc3545",e.target.style.color="white"},onMouseLeave:e=>{e.target.style.backgroundColor="white",e.target.style.color="#dc3545"},title:"Delete Selected Features",children:"Delete"})]})};l().accessToken="pk.eyJ1IjoiYW5keTYzMDkiLCJhIjoiY205MWJ1ZnR3MDdsdzJpcGp5MzE1amVtayJ9.FMxCO78hxeHn4hC3_xrexg";let x=()=>{let e=(0,n.useRef)(null),t=(0,n.useRef)(null),o=(0,n.useRef)(null),[a,d]=(0,n.useState)(null),[c,x]=(0,n.useState)(0),[b,h]=(0,n.useState)(0),[f,y]=(0,n.useState)(null);(0,n.useEffect)(()=>{let r=new(l()).Map({container:e.current,style:s["3D-Topo"],center:[-74.5,40],zoom:9}),n=new i.A({displayControlsDefault:!1,controls:{point:!0,line_string:!0,polygon:!0,trash:!0}});return r.addControl(n,"top-left"),y(n),r.on("rotate",()=>x(r.getBearing())),r.on("pitch",()=>h(r.getPitch())),r.once("load",()=>{p(r,t,o),function(e){let t=new(l()).GeolocateControl({positionOptions:{enableHighAccuracy:!0},trackUserLocation:!0,showUserHeading:!0});e.addControl(t,"top-right")}(r),function(e){e.on("mousemove",t=>{let o=t.lngLat.lng.toFixed(4),r=t.lngLat.lat.toFixed(4),n=e.queryTerrainElevation(t.lngLat),a=document.getElementById("info");a&&(a.innerHTML="Longitude: ".concat(o,"<br />Latitude: ").concat(r)+(null!==n?"<br />Elevation: ".concat(n.toFixed(2)," m"):""))})}(r)}),d(r),()=>{o.current&&o.current.remove(),r.remove()}},[]),(0,n.useEffect)(()=>{a&&f&&(a.on("draw.create",e=>console.log("Drawn:",e.features)),a.on("draw.update",e=>console.log("Updated:",e.features)),a.on("draw.delete",e=>console.log("Deleted:",e.features)))},[a,f]);let m=e=>{if(!a)return;let r=a.getCenter(),n=a.getZoom(),l=a.getBearing(),i=a.getPitch();a.setStyle(s[e]),a.once("style.load",()=>{a.setCenter(r),a.setZoom(n),a.setBearing(l),a.setPitch(i),p(a,t,o),a.addSource("mapbox-dem",{type:"raster-dem",url:"mapbox://mapbox.terrain-rgb",tileSize:512,maxzoom:14}),a.setTerrain({source:"mapbox-dem",exaggeration:1.5})})};return(0,r.jsxs)("div",{style:{position:"relative",height:"100vh",width:"100%"},children:[(0,r.jsx)("div",{ref:t,style:{position:"absolute",zIndex:1,width:"50%",left:"50%",marginLeft:"-48%",top:"10px"}}),(0,r.jsx)(g,{draw:f,map:a}),(0,r.jsx)("div",{ref:e,style:{width:"100%",height:"100%"}}),(0,r.jsx)("div",{id:"info",style:{position:"absolute",bottom:"70px",left:"10px",padding:"5px 10px",background:"rgba(0, 0, 0, 0.7)",color:"#fff",fontSize:"12px",borderRadius:"3px",zIndex:1}}),(0,r.jsx)(u,{mapBearing:c,mapPitch:b,resetNorthAndTilt:()=>{a&&a.easeTo({bearing:0,pitch:0,duration:1e3})}}),(0,r.jsx)("div",{style:{position:"absolute",bottom:"25px",right:"10px",display:"flex",zIndex:2,backgroundColor:"rgba(255, 255, 255, 0.7)",borderRadius:"5px",padding:"5px"},children:Object.keys(s).map((e,t)=>(0,r.jsx)("button",{onClick:()=>m(e),style:{marginRight:t<3?"10px":"0",backgroundColor:"transparent",border:"2px solid #007bff",padding:"8px 16px",borderRadius:"5px",fontSize:"14px",color:"#007bff",cursor:"pointer"},onMouseEnter:e=>{e.target.style.backgroundColor="#007bff",e.target.style.color="white"},onMouseLeave:e=>{e.target.style.backgroundColor="transparent",e.target.style.color="#007bff"},children:e},t))})]})}}}]);