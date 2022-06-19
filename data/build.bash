RES=10m
CDN=https://naciscdn.org/naturalearth/${RES}/cultural
COUNTRIES=ne_${RES}_admin_0_countries
STATES=ne_${RES}_admin_1_states_provinces

cd $(dirname ${BASH_SOURCE}); mkdir -p build; cd build
rm country.json state.json ../map-data.json 2> /dev/null
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
	-o country.json format=topojson force

[ -d ${STATES} ] || {
	[ -f ${STATES}.zip ] || curl -O ${CDN}/${STATES}.zip
	unzip -od ${STATES} ${STATES}.zip
}

npx mapshaper -i ${STATES}/${STATES}.shp snap \
	-simplify weighted 5% \
	-filter-islands min-area="500000000" remove-empty \
	-rename-fields code=adm0_a3 \
	`#remove sparse region areas` \
	-erase bbox=-149.7,-17.8,-149.1,-17.4 \
	-erase bbox=172.6,52.7,173.5,53.1 \
	`# remove overlapping area between alaska and russia` \
	-erase bbox=-179.2,51.1,-167.7,63.9 \
	`# remove north and south poles` \
	-clip bbox=-181,-57,181,87 \
	-filter 'code !== "ATA"' \
	`# normalize some odd territory data` \
	-each 'code="KAZ"' where='code === "KAB"' \
	-each 'code="FRG";' where='code === "FRA" && iso_3166_2 === "FR-GF"' \
	-filter 'code !== "FRA" || type_en !== "Overseas department"' \
	-filter 'code !== "SGS"' \
	-filter 'code !== null' \
	-filter-fields code,name \
	-o state.json format=topojson bbox force

npx mapshaper -i country.json state.json combine-files \
	-rename-layers country-raw,state \
	-join country-raw target=state keys=code,code fields=country,wiki,region \
	-dissolve code target=state copy-fields=code,country,wiki,region + name=country \
	-each target=country 'country="Eswatini";' where='code === "SWZ"' \
	-each target=country 'country="French Guiana"; wiki="Q3769"; region="South America"' where='code === "FRG"' \
	-each target=country 'type="country"' \
	-rename-fields target=country name=country \
	-dissolve region target=country copy-fields=region + name=region \
	-rename-fields target=region name=region \
	-each target=region 'type="region"' \
	-dissolve target=region + name=world \
	-each target=world 'type="world"' \
	-each target=state 'type="state"' \
	-filter-fields target=state code,name,type \
	-o ../map-data.json format=topojson bbox force target=world,region,country,state

# TODO split country states
#[ -d states ] || {