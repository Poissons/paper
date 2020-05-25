/* eslint-disable camelcase */
/* global d3 */
Promise.all([d3.csv('./data/all_data_early.csv'), d3.json('./data/all_data_early.json')]).then(
    ([early_csv, early_json]) => {
        console.log(early_json)
        // 由属到种到种全名的map
        const category_species_species_name = new Map()
        for (const data of Object.values(early_json)) {
            let map
            if (category_species_species_name.has(data.category)) {
                map = category_species_species_name.get(data.category)
            } else {
                map = new Map()
                category_species_species_name.set(data.category, map)
            }
            let set
            if (map.has(data.species)) {
                set = map.get(data.species)
            } else {
                set = new Set()
                map.set(data.species, set)
            }
            set.add(data.species_name)
        }
        console.log(category_species_species_name)
    },
)

    // //得到由种到种全名的map
    // const species_species_name=new Map();
    // all_species.forEach(function (d) {
    //     let tempSet=new Set();
    //     for(let i in early_json){
    //         if(early_json[i]['species']===d){
    //             tempSet.add(early_json[i]['species_name']);
    //         }
    //     }
    //     species_species_name.set(d,tempSet);
    // });

// console.log(tempSet)
    //得到由属到种到种全名的map
//     const category_species_species_name=new Map();
//     category_species.forEach(function(value,key){
//         let tempSet=value;
//         let tempMap=new Map();
//         tempSet.forEach(function (d) {
//             console.log(d);
//             tempMap.set(d,species_species_name.get(d));
//         });
//         category_species_species_name.set(key,tempMap)
// 　　　　});
//     console.log(category_species_species_name);
