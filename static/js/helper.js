
function detCartRemoval(previous, current, dLpak) {
    if (current < previous) {
        window.dataLayer.push({
            'event': 'removeFromCart',
            'ecommerce': {
                'remove': {                               // 'remove' actionFieldObject measures.
                    'products': [{                          //  removing a product to a shopping cart.
                        'name': dLpak['name'],
                        'id': dLpak['id'],
                        'category': dLpak['category'],
                        'quantity': previous - current
                    }]
                }
            }
        });
    }
    else {}
    var select = document.getElementById('quantity_' + dLpak['id']);
    select.form.submit();
}

