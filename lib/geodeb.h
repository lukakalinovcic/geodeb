#include <cassert>
#include <cstdarg>
#include <cstdlib>
#include <iomanip>
#include <sstream>
#include <string>
#include <vector>

#define _GD_CONCAT(a, b) a##b
#define _GD_ARG_COUNT(...) _GD_ARG_COUNT_(__VA_ARGS__, _GD_RSEQ_N())
#define _GD_ARG_COUNT_(...) _GD_ARG_N(__VA_ARGS__)
#define _GD_ARG_N(_1, _2, _3, _4, _5, _6, _7, _8, _9, N, ...) N
#define _GD_RSEQ_N() 9, 8, 7, 6, 5, 4, 3, 2, 1, 0
#define _GD_VFUNC_NAME(name, n) _GD_CONCAT(name, n)
#define _GD_VFUNC(func, ...) _GD_VFUNC_NAME(func, _GD_ARG_COUNT(__VA_ARGS__))(__VA_ARGS__)

#define GD_INIT(filename)                                   \
  const geodeb::RootScope geodeb_root(                      \
    geodeb::GetFileSingleton(filename, __FILE__, __LINE__), false)
#define GD_DARK(filename)                                   \
  const geodeb::RootScope geodeb_root(                      \
    geodeb::GetFileSingleton(filename, __FILE__, __LINE__), true)
#define GD_SET_PRECISION(precision)             \
  geodeb::SetPrecision(precision)
#define GD_LOG_TO_STDERR(log_to_stderr)         \
  geodeb::SetLogToStderr(log_to_stderr)
  
#define GD_LAYER()                                                      \
  geodeb::Layer _GD_CONCAT(geodeb_layer_, __LINE__)(__LINE__);          \
  _GD_CONCAT(geodeb_layer_, __LINE__)

#define GD_PAUSE()                              \
  geodeb::Breakpoint(__LINE__)

#define GD_POINT3(x, y, attr)                   \
  geodeb::Point(x, y, attr, __LINE__)
#define GD_POINT2(x, y)                         \
  GD_POINT3(x, y, "")
#define GD_POINT(...) _GD_VFUNC(GD_POINT, __VA_ARGS__)

#define GD_SEGMENT5(x1, y1, x2, y2, attr)               \
  geodeb::Segment(x1, y1, x2, y2, attr, __LINE__)
#define GD_SEGMENT4(x1, y1, x2, y2)             \
  GD_SEGMENT5(x1, y1, x2, y2, "")
#define GD_SEGMENT(...) _GD_VFUNC(GD_SEGMENT, __VA_ARGS__)

#define GD_TRIANGLE7(x1, y1, x2, y2, x3, y3, attr)              \
  geodeb::Triangle(x1, y1, x2, y2, x3, y3, attr, __LINE__)
#define GD_TRIANGLE6(x1, y1, x2, y2, x3, y3)    \
  GD_TRIANGLE7(x1, y1, x2, y2, x3, y3, "")
#define GD_TRIANGLE(...) _GD_VFUNC(GD_TRIANGLE, __VA_ARGS__)

#define GD_RECTANGLE5(x1, y1, x2, y2, attr)             \
  geodeb::Rectangle(x1, y1, x2, y2, attr, __LINE__)
#define GD_RECTANGLE4(x1, y1, x2, y2)    \
  GD_RECT5(x1, y1, x2, y2, "")
#define GD_RECTANGLE(...) _GD_VFUNC(GD_RECTANGLE, __VA_ARGS__)
#define GD_RECT(...) _GD_VFUNC(GD_RECTANGLE, __VA_ARGS__)

#define GD_LINE5(x1, y1, x2, y2, attr)          \
  geodeb::Line(x1, y1, x2, y2, attr, __LINE__)
#define GD_LINE4(x1, y1, x2, y2)                \
  GD_LINE5(x1, y1, x2, y2, "")
#define GD_LINE(...) _GD_VFUNC(GD_LINE, __VA_ARGS__)

#define GD_CIRCLE4(x, y, r, attr)               \
  geodeb::Circle(x, y, r, attr, __LINE__)
#define GD_CIRCLE3(x, y, r)                     \
  GD_CIRCLE4(x, y, r, "")
#define GD_CIRCLE(...) _GD_VFUNC(GD_CIRCLE, __VA_ARGS__)
#define GD_CIRC(...) _GD_VFUNC(GD_CIRCLE, __VA_ARGS__)

#define GD_POLYGON2(attr, code)                                 \
  { geodeb::PolyBuilder poly(attr, true, __LINE__); code } 0
#define GD_POLYGON1(code)                       \
  GD_POLYGON2("", code);
#define GD_POLYGON(...) _GD_VFUNC(GD_POLYGON, __VA_ARGS__)

#define GD_POLYLINE2(attr, code)                                \
  { geodeb::PolyBuilder poly(attr, false, __LINE__); code } 0
#define GD_POLYLINE1(code)                      \
  GD_POLYLINE2("", code);
#define GD_POLYLINE(...) _GD_VFUNC(GD_POLYLINE, __VA_ARGS__)

#define GD_POLYPOINT(x, y) poly.Add(x, y, __LINE__)

namespace geodeb {
  
// Global vars.
FILE* geodeb_file = nullptr;
std::string pad;
bool log_to_stderr = true;
int precision = 3;
bool poly_active = false;
bool omit_comma = true;

void AddPadding() {
  pad += "  ";
}
void RemovePadding() {
  pad.resize(pad.size() - 2);
}

void json_println(const char* format, ...) {
  if (geodeb::omit_comma) {
    fprintf(geodeb_file, "\n");
    geodeb::omit_comma = false;
  } else {
    fprintf(geodeb_file, ",\n");
  }
  fprintf(geodeb_file, "%s", pad.c_str());
  va_list args;
  va_start(args, format);
  vfprintf(geodeb_file, format, args);
  va_end(args);
}
void json_print_string(const std::string& key, const std::string& val) {
  json_println("\"%s\": \"%s\"", key.c_str(), val.c_str());
}
void json_print_int(const std::string& key, int val) {
  json_println("\"%s\": %d", key.c_str(), val);
}
void json_print_double(const std::string& key, double val) {
  static char format[64];
  sprintf(format, "\"%%s\": %%.%dlf", geodeb::precision);
  json_println(format, key.c_str(), val);
}
void json_start_array(const std::string& key) {
  json_println("\"%s\": [", key.c_str());
  geodeb::omit_comma = true;
  AddPadding();
}
void json_end_array() {
  RemovePadding();
  geodeb::omit_comma = true;
  json_println("]");
}
void json_start_object() {
  json_println("{");
  geodeb::omit_comma = true;
  AddPadding();
}
void json_start_object(const std::string& key) {
  json_println("\"%s\": {", key.c_str());
  geodeb::omit_comma = true;
  AddPadding();
}
void json_end_object() {
  RemovePadding();
  geodeb::omit_comma = true;
  json_println("}");
}
void log_prefix(int line) {
  // TODO(kalinov): Do it in a less hacky way.
  const int start = std::min(8, (int)pad.size());
  fprintf(stderr, "L%03d: %s", line, pad.c_str() + start);
}
 
std::string JsonEscape(const std::string &s) {
  std::ostringstream o;
  for (auto c = s.cbegin(); c != s.cend(); c++) {
    if (*c == '"' || *c == '\\' || ('\x00' <= *c && *c <= '\x1f')) {
      o << "\\u"
        << std::hex << std::setw(4) << std::setfill('0') << (int)*c;
    } else {
      o << *c;
    }
  }
  return o.str();
}

class Operation : public std::ostringstream {
 public:
  Operation(const std::string& type, int line) : line_(line) {
    json_start_object();
    json_print_string("type", type);
    json_print_int("line", line);
  }
  ~Operation() {
    if (!this->str().empty()) {
      json_print_string("label", JsonEscape(this->str()).c_str());
    }
    json_end_object();
  }
 protected:
  int line_;
};

class OperationWithLogging : public Operation {
 public:
  OperationWithLogging(const std::string& type, int line,
                       const std::vector<double>& args,
                       bool multiline=false)
      : Operation(type, line),
        multiline_(multiline) {
    if (poly_active) {
      fprintf(stderr, "geodeb: You can only use GD_POLYPOINT while building a polyline.");
      abort();
    }
    if (geodeb::log_to_stderr) {
      log_prefix(line_);
      static char format[64];
      sprintf(format, "%%.%dlf", geodeb::precision);
      fprintf(stderr, "%s(", type.c_str());
      for (int i = 0; i < args.size(); ++i) {
        if (i > 0) fprintf(stderr, ", ");
        fprintf(stderr, format, args[i]);
      }
      if (!multiline_) {
        fprintf(stderr, ")");
      } else {
        fprintf(stderr, "\n");
      }
    }
  }
  ~OperationWithLogging() {
    if (geodeb::log_to_stderr) {
      if (multiline_) {
        log_prefix(line_);
        fprintf(stderr, ")");
      }
      if (!this->str().empty()) {
        fprintf(stderr, " << \"%s\"\n", this->str().c_str());
      } else {
        fprintf(stderr, "\n");
      }
    }
  }
 private:
  bool multiline_;
};

class Layer : public OperationWithLogging {
 public:
  Layer(int line) : OperationWithLogging("layer", line, {}, true) {
    json_start_array("children");
  }
  ~Layer() {
    json_end_array();
  }
};

class Breakpoint : public OperationWithLogging {
 public:
  Breakpoint(int line) : OperationWithLogging("break", line, {}) {}
};

class Point : public OperationWithLogging {
 public:
  Point(double x, double y, const std::string& attr, int line) :
      OperationWithLogging("point", line, {x, y}) {
    json_print_double("x", x);
    json_print_double("y", y);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class Segment : public OperationWithLogging {
 public:
  Segment(double x1, double y1,
          double x2, double y2,
          const std::string& attr, int line)
      : OperationWithLogging("segment", line, {x1, y1, x2, y2}) {
    json_print_double("x1", x1);
    json_print_double("y1", y1);
    json_print_double("x2", x2);
    json_print_double("y2", y2);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class Triangle : public OperationWithLogging {
 public:
  Triangle(double x1, double y1,
           double x2, double y2,
           double x3, double y3,
           const std::string& attr, int line)
      : OperationWithLogging("triangle", line, {x1, y1, x2, y2, x3, y3}) {
    json_print_double("x1", x1);
    json_print_double("y1", y1);
    json_print_double("x2", x2);
    json_print_double("y2", y2);
    json_print_double("x3", x3);
    json_print_double("y3", y3);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class Rectangle : public OperationWithLogging {
 public:
  Rectangle(double x1, double y1,
            double x2, double y2,
            const std::string& attr, int line)
      : OperationWithLogging("rect", line, {x1, y1, x2, y2}) {
    json_print_double("x1", x1);
    json_print_double("y1", y1);
    json_print_double("x2", x2);
    json_print_double("y2", y2);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class Circle : public OperationWithLogging {
 public:
  Circle(double x, double y, double r,
         const std::string& attr, int line)
      : OperationWithLogging("circ", line, {x, y, r}) {
    json_print_double("x", x);
    json_print_double("y", y);
    json_print_double("r", r);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class Line : public OperationWithLogging {
 public:
  Line(double x1, double y1,
       double x2, double y2,
       const std::string& attr, int line)
      : OperationWithLogging("line", line, {x1, y1, x2, y2}) {
    json_print_double("x1", x1);
    json_print_double("y1", y1);
    json_print_double("x2", x2);
    json_print_double("y2", y2);
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
  }
};

class PolyBuilder : public OperationWithLogging {
 public:
  PolyBuilder(const std::string& attr, bool is_polygon, int line)
      : OperationWithLogging(is_polygon ? "polygon" : "polyline", line, {}, true) {
    geodeb::poly_active = true;
    if (!attr.empty()) {
      json_print_string("attr", attr);
    }
    json_start_array("points");
  }
  ~PolyBuilder() {
    json_end_array();
    geodeb::poly_active = false;
  }

  void Add(double x, double y, int line) {
    static char format[64];
    sprintf(format, "[%%.%dlf, %%.%dlf]",
            geodeb::precision, geodeb::precision);
    json_println(format, x, y);
    if (geodeb::log_to_stderr) {
      sprintf(format, "(%%.%dlf, %%.%dlf)\n",
              geodeb::precision, geodeb::precision);
      log_prefix(line);
      fprintf(stderr, format, x, y);
    }
  }
};

class RootScope {
 public:
  RootScope(FILE* f, bool dark) : f(f), dark_(dark) {}
  ~RootScope() {
    json_end_array();
    json_end_object();
    json_print_string("theme", dark_ ? "dark" : "light");
    json_end_object();
    fprintf(geodeb_file, "\n");
    fclose(f);
    fprintf(stderr, "geodeb: Don't forget to remove the debug code before "
            "submitting to online judges!\n");
  }
 private:
  FILE *f;
  bool dark_;
};

FILE* GetFileSingleton(const std::string& filename,
                       const std::string& source_filename,
                       int line) {
  assert(geodeb_file == nullptr);
  geodeb_file = fopen(filename.c_str(), "wt");
  assert(geodeb_file != nullptr);
  json_start_object();
  FILE* source_file = fopen(source_filename.c_str(), "rt");
  if (source_file != nullptr) {
    json_start_array("source_code");
    static char buffer[2048];
    while (fgets(buffer, 2048, source_file) != nullptr) {
      json_println("\"%s\"", JsonEscape(buffer).c_str());
    }
    fclose(source_file);
    json_end_array();
  }
  json_start_object("root");
  json_print_string("type", "begin");
  json_print_int("line", line);
  json_start_array("children");
  return geodeb_file;
}

void SetPrecision(int precision) {
  assert(precision >= 0 && precision <= 20);
  geodeb::precision = precision;
}

void SetLogToStderr(bool log_to_stderr) {
  geodeb::log_to_stderr = log_to_stderr;
}

}  // namespace geodeb
