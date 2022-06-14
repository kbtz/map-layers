RES=10m
CDN=https://naciscdn.org/naturalearth/${RES}/cultural
COUNTRIES=ne_${RES}_admin_0_countries
STATES=ne_${RES}_admin_1_states_provinces

cd $(dirname ${BASH_SOURCE}); mkdir -p build-data; cd build-data
rm countries.json states.json ../map-data.json 2> /dev/null
set -e

[ -d ${COUNTRIES} ] || {
	[ -f ${COUNTRIES}.zip ] || curl -O ${CDN}/${COUNTRIES}.zip
	unzip -od ${COUNTRIES} ${COUNTRIES}.zip
}

npx mapshaper -i ${COUNTRIES}/${COUNTRIES}.shp \
	-rename-fields code=ADM0_A3,country=NAME,region=REGION_UN,wiki=WIKIDATAID \
	-each 'region="North America"' where='SUBREGION === "Northern America"' \
	-each 'region="Central America"' where='SUBREGION === "Caribbean" || SUBREGION === "Central America"' \
	-each 'region="South America"' where='SUBREGION === "South America"' \
	-filter-fields code,country,wiki,region \
	-o countries.json format=topojson force

[ -d ${STATES} ] || {
	[ -f ${STATES}.zip ] || curl -O ${CDN}/${STATES}.zip
	unzip -od ${STATES} ${STATES}.zip
}

npx mapshaper -i ${STATES}/${STATES}.shp snap \
	-simplify weighted 5% \
	-filter-islands min-area="100000000" remove-empty \
	-rename-fields code=adm0_a3 \
	`# remove overlapping area between alaska and russia` \
	-erase bbox=-179.2,51.1,-167.7,63.9 \
	`# remove north and south poles` \
	-clip bbox=-181,-57,181,87 \
	-filter 'code !== "ATA"' \
	`# normalize some odd territories` \
	-each 'code="KAZ"' where='code === "KAB"' \
	-each 'code="FRG";' where='code === "FRA" && iso_3166_2 === "FR-GF"' \
	-filter 'code !== "FRA" || type_en !== "Overseas department"' \
	-filter 'code !== null' \
	-filter-fields code,name \
	-o states.json format=topojson bbox force

npx mapshaper -i countries.json states.json combine-files \
	-rename-layers countries-raw,states \
	-join countries-raw target=states keys=code,code fields=country,wiki,region \
	-dissolve code target=states copy-fields=code,country,wiki,region + name=countries \
	-each 'country="French Guiana"; wiki="Q3769"; region="South America"' where='code === "FRG"' \
	-dissolve region target=countries copy-fields=region + name=regions \
	-dissolve target=regions + name=world \
	-rename-fields target=states state=name \
	-filter-fields target=states code,state \
	-o ../map-data.json format=topojson bbox force target=world,regions,countries,states

# TODO split country states
#[ -d states ] || {

cd ..; #rm -r build-data