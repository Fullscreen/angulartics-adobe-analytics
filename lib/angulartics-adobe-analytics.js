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
      var superProperties

      $analyticsProvider.settings.pageTracking.trackRelativePath = true

      $analyticsProvider.registerPageTrack(function (path, properties) {
        var event = {pageName: path}
        angular.extend(event, superProperties.all, properties)

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
          var props = angular.extend({}, superProperties.adobeAll, superProperties[action], properties)
          var linkType = 'o'

          if (action.toUpperCase() === 'DOWNLOAD') {
            linkType = 'd'
          } else if (action.toUpperCase() === 'EXIT') {
            linkType = 'e'
          }

          window.s.tl(this, linkType, action, props)
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
        superProperties = props
      })
    }
  ])
})(window, window.angular)
