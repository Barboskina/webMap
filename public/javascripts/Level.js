class Level {
    constructor(ymaps, maxZoom, floor, jsonPoints, jsonSearchPoint) {
        const LAYER_NAME = 'user#layer' + floor;
        const MAP_TYPE_NAME = 'user#customMap';
        const PIC_WIDTH = 1000;
        const PIC_HEIGHT = 1000;
        const PATH = '../tiles/tiles' + floor;

        let Layer = function () {
            let layer = new ymaps.Layer(PATH + '/%z/%x-%y.svg');
            layer.getZoomRange = function () {
                return ymaps.vow.resolve([0, maxZoom]);
            };
            return layer;
        };

        if (undefined === ymaps.layer) {
            ymaps.layer.storage = new ymaps.layer.Storage();
        }
        ymaps.layer.storage.add(LAYER_NAME, Layer);
        const mapType = new ymaps.MapType(MAP_TYPE_NAME, [LAYER_NAME]);
        ymaps.mapType.storage.add(MAP_TYPE_NAME, mapType);

        let worldSize = Math.pow(2, 2) * 256;

        let createdLevelMap = new ymaps.Map('map', {
            center: [0, 0],
            zoom: maxZoom,
            controls: [],
            type: MAP_TYPE_NAME
        }, {
            projection: new ymaps.projection.Cartesian([[PIC_HEIGHT / 2 - worldSize, -PIC_WIDTH / 2], [PIC_HEIGHT / 2, worldSize - PIC_WIDTH / 2]], [false, false]),
            restrictMapArea: [[-PIC_HEIGHT / 2, -PIC_WIDTH / 2], [PIC_HEIGHT / 2, PIC_WIDTH / 2]]
        });

        createdLevelMap.controls.add(new ymaps.control.ZoomControl({
                options: {
                    size: 'small',
                    position: {
                        right: 10,
                        top: 100
                    }
                }
            })
        );


        //////////////метки, зависящие от масштаба///////////////////////////
        if (jsonPoints) {
            jsonPoints = jsonPoints.replace(/&quot;/ig,'"');
            let points = JSON.parse(jsonPoints);
            let collections = [];

            for (let j = 0; j < points.length; j++) {
                let collection = new ymaps.GeoObjectCollection();
                for (let i = 0; i < points[j].length; i++) {
                    let options = {};
                    if (points[j][i].preset) {
                        options = {preset: points[j][i].preset};
                    }
                    else {
                        options = {
                            iconLayout: 'default#image',
                            iconImageHref: 'img/icon.png'
                        };
                    }

                    collection.add(new ymaps.Placemark(
                        [points[j][i].x, points[j][i].y], {
                            iconContent: (points[j][i].name === null || points[j][i].name === '') ? points[j][i].id : points[j][i].name,
                        }, options
                    ));
                }
                collections.push(collection);
            }

            let curZoom = createdLevelMap.getZoom();
            for (let i = 0; i < collections.length && i < curZoom; i++) {
                createdLevelMap.geoObjects.add(collections[i]);
            }

            createdLevelMap.events.add('boundschange', function (e) { //если меняется масштаб
                const eMap = e.get('target');// Получение ссылки на объект, сгенерировавший событие (карта).
                const changedZoom = eMap.getZoom();//получение масштаба

                if (changedZoom > curZoom) {
                    createdLevelMap.geoObjects.add(collections[changedZoom-1]);
                }
                if (changedZoom < curZoom) {
                    createdLevelMap.geoObjects.remove(collections[curZoom-1]);
                }
                curZoom = changedZoom;
            });
        }

        if (jsonSearchPoint) {
            jsonSearchPoint = jsonSearchPoint.replace(/&quot;/ig,'"');
            let searchPoint = JSON.parse(jsonSearchPoint);
            createdLevelMap.panTo([searchPoint.x, searchPoint.y]);//и центр карты смещается к этому элементу
        }
    }
}
