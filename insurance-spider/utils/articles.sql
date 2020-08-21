
SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for articles
-- ----------------------------
DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '索引id',
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT '' COMMENT '文章标题',
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '文章链接url',
  `content` varchar(1024) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '文章summary',
  `source` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '文章来源',
  `created` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '文章创建时间',
  `creator` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '文章作者',
  `updatetime` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
SET FOREIGN_KEY_CHECKS=1;
