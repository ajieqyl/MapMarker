//branch function testing
var map = new BMap.Map("l-map");
map.enableScrollWheelZoom();
var point = new BMap.Point(116.404, 39.915);
map.centerAndZoom(point, 15);
addContextMenu(map);

function addContextMenu(map){
	var contextMenu = new BMap.ContextMenu();
	var txtMenuItem = [ {
		text : 'add marker',
		callback : function(p) {
			addOneMark(map, p);
		}
	},
	{
		text : 'get Overlay',
		callback : function() {
			var overlays=map.getOverlays();
			var count=0;
			var countMarker=0;
			for(var i in overlays){
				if(overlays[i] instanceof MapMarker){
					count++;
				}if(overlays[i] instanceof BMap.Marker){
					countMarker++;
				}
				
			}
			alert("num of mapmarker: "+count);
			alert("num of marker: "+countMarker);
		}
	}];
	for ( var i = 0; i < txtMenuItem.length; i++) {
		contextMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,
				txtMenuItem[i].callback, 100));
		
	}
	map.addContextMenu(contextMenu);
}

function addCurveLine(map,fromPoint,toPoint){
	var points = [fromPoint,toPoint];

	var curve = new BMapLib.CurveLine(points, {strokeColor:"blue", strokeWeight:5, strokeOpacity:0.5}); //�������߶���
	map.addOverlay(curve); //��ӵ���ͼ��
	curve.disableEditing(); //�����༭����
	return curve;
}

function createOneSearchMarker(p,index){
	 var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {
		    offset: new BMap.Size(10, 25),
		    imageOffset: new BMap.Size(0, 0 - index * 25)
		  });
	var marker=new BMap.Marker(p,{icon: myIcon});
	addContextMenu2SearchMarker(map,marker);
	return marker;
}

//�����Ϣ����
function addInfoWindow(marker,poi,index){
    var maxLen = 10;
    var name = null;
    if(poi.type == BMAP_POI_TYPE_NORMAL){
        name = "��ַ��  ";
    }else if(poi.type == BMAP_POI_TYPE_BUSSTOP){
        name = "������  ";
    }else if(poi.type == BMAP_POI_TYPE_SUBSTOP){
        name = "������  ";
    }
    // infowindow�ı���
    var infoWindowTitle = '<div style="font-weight:bold;color:#CE5521;font-size:14px">'+poi.title+'</div>';
    // infowindow����ʾ��Ϣ
    var infoWindowHtml = [];
    infoWindowHtml.push('<table cellspacing="0" style="table-layout:fixed;width:100%;font:12px arial,simsun,sans-serif"><tbody>');
    infoWindowHtml.push('<tr>');
    //infoWindowHtml.push('<td style="vertical-align:top;line-height:16px;width:38px;white-space:nowrap;word-break:keep-all">' + name + '</td>');
    infoWindowHtml.push('<td style="vertical-align:top;line-height:16px">' + poi.address + ' </td>');
    infoWindowHtml.push('</tr>');
    infoWindowHtml.push('</tbody></table>');
    var infoWindow = new BMap.InfoWindow(infoWindowHtml.join(""),{title:infoWindowTitle,width:200}); 
    var openInfoWinFun = function(){
        marker.openInfoWindow(infoWindow);
        for(var cnt = 0; cnt < maxLen; cnt++){
            if(!document.getElementById("list" + cnt)){continue;}
            if(cnt == index){
                document.getElementById("list" + cnt).style.backgroundColor = "#f0f0f0";
            }else{
                document.getElementById("list" + cnt).style.backgroundColor = "#fff";
            }
        }
    };
    marker.addEventListener("click", openInfoWinFun);
    return openInfoWinFun;
}

function addOneMark(map, p) {
	var marker = new MapMarker(p);
	marker.enableDragging();
	marker.addEventListener("click", function() {
		var sContent = "lat:" + marker.getPosition().lat + " lng:"
				+ marker.getPosition().lng + " isClick:" + marker.isClick;

		var infoWindow = new BMap.InfoWindow(sContent);
		marker.openInfoWindow(infoWindow);
		
		//add curveline if clicked
		var clickedMarker=null;
		for(var i in map.getOverlays()){
			if(map.getOverlays()[i] instanceof MapMarker && map.getOverlays()[i].isClick==true){
				clickedMarker=map.getOverlays()[i];
				break;
			}
		}
		
		if(clickedMarker!=null){
			var curveLine=addCurveLine(map,clickedMarker.getPosition(),marker.getPosition());
			marker.connectedCurveLine.push(curveLine);
			marker.connectedMarkers.push(clickedMarker);
			
			//clickedMarker.connectedCurveLine.push(curveLine);
			//clickedMarker.connectedMarkers.push(marker);
			clickedMarker.isClick=false;
		}
		
	});
	
	marker.addEventListener("dragend", function(){
		marker.redrawCurveLine(map);
	});
	addContextMenu2Marker(map,marker);
	map.addOverlay(marker);
}

function addContextMenu2Marker(map,marker){
	var contextMenu = new BMap.ContextMenu();
	var txtMenuItem = [ {
		text : 'delete marker',
		callback : function(target) {
			map.removeOverlay(marker);
		}
	} ,
	{
		text : 'add curveLine',
		callback : function() {
			marker.isClick=true;
			alert("please click another marker to add curveline");
		}
	} ];
	for ( var i = 0; i < txtMenuItem.length; i++) {
		contextMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,
				txtMenuItem[i].callback, 100));
		
	}
	marker.addContextMenu(contextMenu);
}

function addContextMenu2SearchMarker(map,marker){
	var contextMenu = new BMap.ContextMenu();
	var txtMenuItem = [ {
		text : 'Yes, this is the place I want',
		callback : function(target) {
			removeAllSearchResults(map);
			changeSelectedSearchResult2MapMarker(map,marker);
		}
	} ];
	for ( var i = 0; i < txtMenuItem.length; i++) {
		contextMenu.addItem(new BMap.MenuItem(txtMenuItem[i].text,
				txtMenuItem[i].callback, 100));
		
	}
	marker.addContextMenu(contextMenu);
}

function changeSelectedSearchResult2MapMarker(map,bmarker){
	addOneMark(map,bmarker.getPosition());
}

function removeAllSearchResults(map){
	var length=map.getOverlays().length;
	var resultArray=map.getOverlays();
	for(var i=0;i<length;i++){
		var overlay=resultArray.pop();
		if(overlay instanceof BMap.Marker && !(overlay instanceof MapMarker)){
			map.removeOverlay(overlay);
		}
	}

}


function MapMarker(point) {
	BMap.Marker.call(this, point);
	this.isClick = false;
	this.connectedMarkers=new Array();
	this.connectedCurveLine=new Array();
}
MapMarker.prototype = new BMap.Marker();
MapMarker.prototype.redrawCurveLine=function(map){
	
	for(var i in map.getOverlays()){
		if(map.getOverlays()[i] instanceof MapMarker){
			redrawOneMarker(map.getOverlays()[i],map);
		}
	}
};

function redrawOneMarker(marker,map){
	//remove old curveLine
	for(var i in marker.connectedCurveLine){
		map.removeOverlay(marker.connectedCurveLine[i]);
	}
	//TODO may stack one of the marker and can not init new array
	marker.connectedCurveLine=new Array();
	//redraw new
	for(var i in marker.connectedMarkers){
		marker.connectedCurveLine.push(addCurveLine(map,marker.getPosition(),marker.connectedMarkers[i].getPosition()));
	}
}

function searchLocation(){
	removeAllSearchResults(map);
	
	var searchKey=document.getElementById("searchKey").value;
	
	var searchOptions={
			onSearchComplete: function(results){
			    // �ж�״̬�Ƿ���ȷ
			    if (local.getStatus() == BMAP_STATUS_SUCCESS){
			    	var s = [];
			    	for (var i = 0; i < results.getCurrentNumPois(); i ++){
			    		
			    		s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
			    		var searchMarker=createOneSearchMarker(results.getPoi(i).point,i);
			    		searchMarker.setTitle(results.getPoi(i).title);
			    		addInfoWindow(searchMarker,results.getPoi(i),i);
			    		map.addOverlay(searchMarker);
			    	}
			    	document.getElementById("r-result").innerHTML = s.join("<br/>");
			    }
			    
			    map.centerAndZoom(results.getPoi(0).point,15);
			}
	};
	
	var local = new BMap.LocalSearch("ȫ��", searchOptions);
	local.search(searchKey);
	//map.centerAndZoom(local.getResults()[0].getPoi(0).point, 15);
	
	//alert("searchKey:"+searchKey+"marker number: "+count);
}