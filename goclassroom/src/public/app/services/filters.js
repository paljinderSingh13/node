app
    .filter('unique', function($filter) {
        return function(collection, keyname) {
            
            var init = '';
            var output = [],
                keys = [];

            angular.forEach(collection, function(item) {
                
                var key = item[keyname];
                
                var data = $filter('filter')(keys,{_id:key._id},true);
                
                if(!data || data == null || data == ""){
                    output.push(item);
                }
                
                keys.push(key);
                
            });
            
            return output;
        };
    });