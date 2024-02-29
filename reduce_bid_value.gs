// Google Ads Script to Lower Keyword Bid to First Page Bid
function main() {
  // Set the minimum allowed CPC value
  var minAllowedCpc = 0.01;

  // Access all enabled campaigns in the specified account
  var campaigns = AdsApp.campaigns().withCondition('Status = ENABLED').get();

  // Loop through campaigns
  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var campaignName = campaign.getName();
    Logger.log('campaign: ' + campaignName);
    
    // Access enabled ad groups in the current campaign
    var adGroups = campaign.adGroups().withCondition('Status = ENABLED').get();

    // Loop through ad groups
    while (adGroups.hasNext()) {
      var adGroup = adGroups.next();
      var adGroupName = adGroup.getName();

      // Access enabled keywords in the current ad group
      var keywords = adGroup.keywords().withCondition('Status = ENABLED').get();

      // Loop through keywords
      while (keywords.hasNext()) {
        var keyword = keywords.next();
        var keywordText = keyword.getText();
        var firstPageCpc = keyword.getFirstPageCpc();

        // Check if the first page CPC is not null
        if (firstPageCpc !== null) {
          var firstPageCpcFixed = firstPageCpc.toFixed(2);
          var currentCpc = keyword.bidding().getCpc().toFixed(2);

          Logger.log('Keyword: ' + keywordText + ' - firstPageCpc: ' + firstPageCpcFixed+ ' - currentCpc: ' + currentCpc);

          // Check if current CPC is higher than first page bid and the first page bid is above the minimum allowed CPC
          if (currentCpc > firstPageCpcFixed && firstPageCpcFixed > minAllowedCpc) {
            try {
              // Lower the bid to match the first page bid
              setKeywordCpcBid(campaignName, adGroupName, keywordText, firstPageCpcFixed);
              Logger.log('Keyword: ' + keywordText + ' - Lowered bid to: ' + firstPageCpcFixed);
            } catch (e) {
              Logger.log('Error setting CPC for keyword: ' + keywordText + ', value: ' + firstPageCpcFixed + ', error' + e);
            }
          }
        } else {
          Logger.log('Keyword: ' + keywordText + ' - firstPageCpc: No estimate available');
        }
      }
    }
  }

  // Log completion
  Logger.log('Finished adjusting keyword bids for all enabled campaigns');
}

function setKeywordCpcBid(campaignName, adGroupName, keywordText, keywordMaxCpcBid) {
  const keyword = AdsApp.keywords()
    .withCondition(`campaign.name = '${campaignName}'`)
    .withCondition(`ad_group.name = '${adGroupName}'`)
    .withCondition(`ad_group_criterion.keyword.text = '${keywordText}'`)
    .get()
    .next();

  keyword.bidding().setCpc(+keywordMaxCpcBid);
}
