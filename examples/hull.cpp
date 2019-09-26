#include "geodeb.h"

#include <algorithm>
#include <cstdio>
#include <vector>

struct Point {
  int x, y;
};

int ccw(const Point &a, const Point &b, const Point &c) {
  const int t = (c.x - a.x) * (b.y - a.y) - (b.x - a.x) * (c.y - a.y);
  if (t < 0) return -1;
  if (t > 0) return 1;
  return 0;
}

int main() {
  GD_INIT("debug.out");
  int n;
  scanf("%d", &n);
  std::vector<Point> pts;
  for (int i = 0; i < n; ++i) {
    Point p;
    scanf("%d%d", &p.x, &p.y);
    GD_POINT(p.x, p.y, "color:red") << i;
    pts.push_back(p);
  }
  GD_LINE(0, 0, 1, 0, "color:yellow") << "x axis";
  GD_LINE(0, 0, 0, 1, "color:yellow") << "y axis";
  GD_PAUSE() << "input done!";

  std::sort(pts.begin(), pts.end(),
            [](const Point& a, const Point& b) {
              if (a.x != b.x) return a.x < b.x;
              return a.y < b.y;
            });
  // {
  //   GD_LAYER(first);
  //   GD_POLYLINE("color:rainbow",
  //               {
  //                 for (const Point& p : pts) {
  //                   GD_POLYPOINT(p.x, p.y);
  //                 }
  //               });
  // }
  const Point& O = pts[0];
  std::sort(pts.begin() + 1, pts.end(),
            [&](const Point& a, const Point& b) {
              return ccw(O, a, b) < 0;
            });
  // {
  //   GD_LAYER(second);
  //   GD_POLYLINE("color:rainbow",
  //               {
  //                 for (const Point& p : pts) {
  //                   GD_POLYPOINT(p.x, p.y);
  //                 }
  //               });
  // }
  for (int i = 1; i < n; ++i) {
    GD_SEGMENT(pts[0].x, pts[0].y, pts[i].x, pts[i].y, "color:#ccc"); 
  }
  
  int m = 1;
  std::vector<int> hull = {0};
  for (int i = 1; i < n; ++i) {
    while (m >= 2 && ccw(pts[hull[m - 2]], pts[hull[m - 1]], pts[i]) > 0) {
      GD_LAYER(inner) << "hull size " << m;
      GD_POLYLINE("color:red",
                  {
                    GD_POLYPOINT(pts[hull[m - 2]].x, pts[hull[m - 2]].y);
                    GD_POLYPOINT(pts[hull[m - 1]].x, pts[hull[m - 1]].y);
                    GD_POLYPOINT(pts[i].x, pts[i].y);
                  });
      --m;
      hull.pop_back();
      GD_POLYLINE("color:blue",
                  {
                    for (int j : hull) {
                      GD_POLYPOINT(pts[j].x, pts[j].y);
                    }
                  });
    }
    hull.push_back(i);
    ++m;
    GD_LAYER(outer) << "hull size " << m;
    GD_POLYLINE("color:blue",
		{
		  for (int i : hull) {
		    GD_POLYPOINT(pts[i].x, pts[i].y);
		  }
		});
  }
  GD_POLYLINE("color:blue",
	      {
		for (int i : hull) {
		  GD_POLYPOINT(pts[i].x, pts[i].y);
		}
		GD_POLYPOINT(pts[0].x, pts[0].y);
	      });
  return 0;
}
