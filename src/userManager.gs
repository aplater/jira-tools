/**
 * @desc Returns a list of users that match the search string.
 *       This resource cannot be accessed anonymously.
 *       Sample: 
 *         findUser('a%')
 *         findUser('ab%')
 *         findUser('abc%')
 *         findUser('z%')
 * @param usernameTerm {string}  A query string used to search username, name or e-mail address
 * @param {boolean} minimal  Def:FALSE; Returning data only includes minimal info (displayName,name[,active])
 * @param {integer} maxResults  Def:100; sets max user records fetched from Jira api
 * @param {string} methodOverride  Dev:null, workarround api method name ie: "userSearchV2"
 * @return {Array}
 */
function findUser(usernameTerm, minimal, maxResults, methodOverride) {
  var _method = 'userSearch', 
      method = methodOverride || _method,
      usernameTerm = usernameTerm || '',
      minimal = minimal || false,
      maxResults = maxResults || 100,
      users = [], reqData = {};

  /**
   * @desc OnSuccess handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return Mixed
   */
  var ok = function(resp, httpResp, status){
    if(resp) {
      if(resp.length == 0) return users;

      var user;
      for(var i=0; i<resp.length; i++) {
        user = unifyIssueAttrib((minimal ? 'userMin' : 'user'), resp[i]);
        user.usernameOrAccountId = (user.accountId && user.accountId.length > 0) ? user.accountId : user.name;
        users.push(user);
      }
    } else {
      // Something funky is up with the JSON response.
      debug.error('Failed searching for user: %s ; %s', httpResp, resp);
      return users;
    }
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return {Array}
   */
  var error = function(resp, httpResp, status) {
    debug.error("Failed api search request with error status [%s]!\\n%s", status, resp.errorMessages.join("\\n"));
    return users;
  };

  var request = new Request();

  if (methodOverride) {
    reqData = {
      'query': usernameTerm,
      'maxResults': maxResults
    };
  } else {
    reqData = {
      'username': usernameTerm,
      'maxResults': maxResults
    };
  }

  request.call(method, reqData)
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return users;
}

/**
 * @desc Returns groups with substrings matching a given query.
 *       Sample: 
 *         findGroup('a')
 *         findGroup('ab')
 *         findGroup('abc')
 *         findGroup('z')
 * @param groupTerm {string}  A query string used to search group name
 * @param {boolean} minimal  Def:FALSE; Returning data only includes minimal info (displayName,name[,active])
 * @return {Array}
 */
function findGroup(groupTerm, minimal) {
  var method = 'groupSearch', 
      groupTerm = groupTerm || '',
      minimal = minimal || false,
      groups = [];

  groupTerm = trimChar(groupTerm, "%");

  /**
   * @desc OnSuccess handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return Mixed
   */
  var ok = function(resp, httpResp, status) {
    if(resp && resp.hasOwnProperty('groups')) {
      if(resp.groups.length == 0) return groups;

      var group;
      for(var i=0; i<resp.groups.length; i++) {
        group = unifyIssueAttrib((minimal ? 'groupMin' : 'group'), resp.groups[i]);
        groups.push(group);
      }
    } else {
      // Something funky is up with the JSON response.
      debug.error('Failed searching for group: %s ; %s', httpResp, resp);
      return groups;
    }
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return {Array}
   */
  var error = function(resp, httpResp, status) {
    debug.error("Failed api search request with error status [%s]!\\n%s", status, resp.errorMessages.join("\\n"));
    return groups;
  };

  var request = new Request();

  request.call(method, {query: groupTerm})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return groups;
}
