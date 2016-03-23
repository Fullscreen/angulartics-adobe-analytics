(function (window, angular) {
  'use strict'

  /**
   * @ngdoc overview
   * @name angulartics.adobe.analytics
   * Enables analytics support for Adobe Analytics (http://adobe.com/analytics)
   */
  angular.module('angulartics.adobe.analytics', ['angulartics']).config([
    '$analyticsProvider',
    function (
      $analyticsProvider
    ) {
      $analyticsProvider.settings.pageTracking.trackRelativePath = true
      $analyticsProvider.settings.adobeA = {
        properties: {
          eventClass: {},
          global: {},
          page: {}
        }
      }

      $analyticsProvider.registerPageTrack(function (path) {
        var event = {pageName: path}
        angular.extend(
          event,
          $analyticsProvider.settings.adobeA.properties.global,
          $analyticsProvider.settings.adobeA.properties.page
        )

        if (window.s) {
          window.s.t(event)
        }
      })

      /**
       * Track Event in Adobe Analytics
       * @name eventTrack
       * @param {string} eventType Required 'eventType' (string) kind of event
       * @param {object} properties (object) event properties to be passed
       * along for this event only, overrides event class and global property defaults
       */
      $analyticsProvider.registerEventTrack(function (eventType, properties) {
        if (window.s && eventType) {
          properties = properties || {}
          var eventLabel = eventType
          var adobeAprops = $analyticsProvider.settings.adobeA.properties
          // a global event map overriden by a event type map, later overridden by event specific map
          var eventConfig = angular.extend({}, adobeAprops.eventMap, adobeAprops.eventClass[eventType])
          var props = {}
          var linkTrackVars = []
          var events
          var linkTrackIgnore = ['account', 'events', 'linkTrackEvents']

          if (eventConfig) {
            if (eventConfig.eventLabel) {
              eventLabel = eventConfig.eventLabel
            }

            events = properties.eventIds || eventConfig.eventIds
            if (events) {
              properties.events = events
              // TODO: Make eventConfig one analytics label to many or one id
              // eg. it'd be nice to be able to override eventIds and have it
              // stick to linkTrackEvents as well
              properties.linkTrackEvents = events
              linkTrackVars.unshift('events')
              delete properties.eventIds
            }

            angular.forEach(eventConfig, function (adobeLabel, analyticsLabel) {
              if (angular.isDefined(properties[analyticsLabel])) {
                // move metric value to adobe's label
                properties[adobeLabel] = properties[analyticsLabel]
                delete properties[analyticsLabel]
              }
            })
          }

          delete properties.eventType

          angular.extend(
            props,
            adobeAprops.global,
            properties
          )

          linkTrackVars = linkTrackVars.concat(Object.keys(props).filter(function (obKey) {
            return linkTrackIgnore.indexOf(obKey) === -1
          }))
          props.linkTrackVars = linkTrackVars.join(',')

          var linkType = 'o'

          if (eventLabel.toUpperCase() === 'DOWNLOAD') {
            linkType = 'd'
          } else if (eventLabel.toUpperCase() === 'EXIT') {
            linkType = 'e'
          }

          window.s.tl(this, linkType, eventLabel, props)
        }
      })

      /**
       * Set properties that should be sent for every event or every class of
       * event.
       *
       * Note as this is being used to set defaults specifically for adobe
       * it may interact poorly with other super properties. Invoking this
       * before other plugins may mitigate that risk. If a namespacing feature
       * is ever introduced please revisit this code and update
       * https://github.com/angulartics/angulartics/issues/237#issuecomment-142823983
       *
       * @name SuperProperties
       * @param {object} props Required 'props' (object) that should be now sent
       * with every request
       * @param {object} props.adobeAll - properties that should be sent for every request
       * @param {object} props.<name> - set of properties that should be sent for a
       * class of events
       */
      $analyticsProvider.registerSetSuperProperties(function (props) {
        $analyticsProvider.settings.adobeA.properties.global = props.global
        $analyticsProvider.settings.adobeA.properties.eventClass = props.eventClass
        $analyticsProvider.settings.adobeA.properties.eventMap = props.eventMap
      })
    }
  ])
})(window, window.angular)
