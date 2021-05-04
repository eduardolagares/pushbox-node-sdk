# DO NOT USE IT YET


Pushbox Node SDK
=========

A sdk for Pushbox (https://github.com/eduardolagares/pushbox)

## Installation

  `npm install pushbox-node-sdk`

## Usage

    PushboxClient.init({
        provider_label: 'expo',
        system_label: 'mysystem',
        api_host: 'http://localhost',
        api_key: '#your-user-api-key',
        storage: AsyncStorage // Use AsyncStorage for React or another onde that you can setItem, getItem and removeItem
    });


    

## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.