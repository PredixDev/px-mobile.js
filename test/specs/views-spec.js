var pxMobile = require('../../dist/px-mobile');

/** @test {Views} */
describe('pxMobile.Views', function() {
  it('should be defined', function() {
    assert.ok(pxMobile.Views);
  });
  describe('Views', function() {
    var appViews = null;
    var exampleViews = [{
      id: 'view0',
      title: 'view 0'
    }, {
      id: 'view1',
      title: 'view 1'
    }, {
      id: 'view2',
      title: 'view 2'
    }, {
      id: 'view3',
      title: 'view 3'
    }, {
      id: 'view4',
      title: 'view 4'
    }, {
      id: 'view5',
      title: 'view 5'
    }];

    beforeEach(function() {
      appViews = new pxMobile.Views({
        id: 'appjsViews',
        selected: '0',
        views: exampleViews
      });
    });

    it('should select the correct view', function() {
      assert.equal(appViews.getSelectedIndex(), 0);
      appViews.selectView('view1');
      assert.equal(appViews.getSelectedIndex(), 1);
      assert.equal(appViews.selected, 1);
    });

    it('nextView() - should select next view and not loop.', function() {
      assert.equal(appViews.getSelectedIndex(), 0);
      assert.equal(appViews.nextView(), 1);
      assert.equal(appViews.nextView(), 2);
      assert.equal(appViews.nextView(), 3);
      assert.equal(appViews.nextView(), 4);
      assert.equal(appViews.nextView(), 5);
      assert.equal(appViews.nextView(), 0);
      assert.equal(appViews.nextView(), 1);
    });

    it('prevView() - should select the prev view.', function() {
      assert.equal(appViews.nextView(), 1);
      assert.equal(appViews.nextView(), 2);
      assert.equal(appViews.nextView(), 3);
      assert.equal(appViews.nextView(), 4);
      assert.equal(appViews.nextView(), 5);
      assert.equal(appViews.prevView(), 4);
      assert.equal(appViews.prevView(), 3);
      assert.equal(appViews.prevView(), 2);
      assert.equal(appViews.prevView(), 1);
      assert.equal(appViews.prevView(), 0);
      assert.equal(appViews.prevView(), 0);


    });

  });
});
