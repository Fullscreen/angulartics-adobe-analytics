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
       * @param {string} action Required 'action' (string) associated with the event
       * @param {properties} action (properties) event properties to be passed
       * along for this event only, overrides event class and global property defaults
       */
      $analyticsProvider.registerEventTrack(function (action, properties) {
        if (window.s && action) {
          var actionLabel = action
          var adobeAprops = $analyticsProvider.settings.adobeA.properties

          var props = angular.extend(
            {},
            adobeAprops.global
          )

          var actionConfig = adobeAprops.eventClass[action]
          if (actionConfig) {
            var linkTrackVars = []
            if (actionConfig.eventLabel) {
              actionLabel = actionConfig.eventLabel
            }

            if (actionConfig.eventIds) {
              properties.events = actionConfig.eventIds
              linkTrackVars.unshift('events')
            }

            angular.forEach(actionConfig, function (adobeLabel, analyticsLabel) {
              if (angular.isDefined(properties[analyticsLabel])) {
                linkTrackVars.unshift(adobeLabel)
                // move metric value to adobe's label
                properties[adobeLabel] = properties[analyticsLabel]
                delete properties[analyticsLabel]
              }
            })

            properties.linkTrackVars = linkTrackVars
          }

          delete properties.eventType

          angular.extend(props, properties)

          var linkType = 'o'

          if (actionLabel.toUpperCase() === 'DOWNLOAD') {
            linkType = 'd'
          } else if (actionLabel.toUpperCase() === 'EXIT') {
            linkType = 'e'
          }

          window.s.tl(this, linkType, actionLabel, props)
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
      })
    }
  ])
})(window, window.angular)
