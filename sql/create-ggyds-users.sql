-- 批量创建管理员和普通用户
-- 管理员: GGYDZ
-- 参考用户: SSTAFF
-- 普通用户: GGYDS01 到 GGYDS20
-- 所有用户角色为"user"（普通用户），享有与SSTAFF账号相同的权限

-- 管理员: GGYDZ, 密码: Hgyxiaoyu1314.
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDZ', '$2b$12$ENN75zZk7tvnEI2YCqOQeezhEYhPy0J2FGFYzoccJ/VhSQT3DcVYG', 'admin', 'Hgyxiaoyu1314.')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: SSTAFF, 密码: Staff2024
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('SSTAFF', '$2b$12$10EEGydIO8k8Yoc9OnUH/.1QpocmnAiI1xu79cmL7A2eNHzmYdmnm', 'user', 'Staff2024')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS01, 密码: 9gQM!!jgJx3E
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS01', '$2b$12$1uhjrhV3X6s/UKZ6f1.xCOF3k6duug7PUFhHW0Aaki.Do/VULXAqC', 'user', '9gQM!!jgJx3E')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS02, 密码: fDU5j7q6pQoU
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS02', '$2b$12$VtySsQ6lCdoZaByxlgyZ4O2E2d8jd/bX4uJvl2vaf5eo.bqAxboIS', 'user', 'fDU5j7q6pQoU')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS03, 密码: SeZUMp8GtDLL
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS03', '$2b$12$sEDACXvK3FB9TA8ZSAQ6UOPq/bZBFceNDUplFvysWbP9CmLmMBXRq', 'user', 'SeZUMp8GtDLL')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS04, 密码: Zsmrm668hc2V
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS04', '$2b$12$yB4U.dY/FQkfOAnZDK0JkeEgYknPNP2bdS2CaCxlYEj7w0rODELte', 'user', 'Zsmrm668hc2V')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS05, 密码: hR4Z6SnQst5z
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS05', '$2b$12$vjacimfH6DGgQGrm3B4fPuRWzo1UIGtdeFbAXZFcLD/x3kAvoKd3O', 'user', 'hR4Z6SnQst5z')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS06, 密码: JtxaoLsUMiF9
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS06', '$2b$12$iX3nKgWtG3LerZfBPYrBFO/PdUqWPgyG99hNiHGDjU5R0TjPdWNtG', 'user', 'JtxaoLsUMiF9')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS07, 密码: ogFoBFMGFEG2
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS07', '$2b$12$suMQDG3DqFVm2njen6CBfOwDgcKbkdC8wngZk7S8BhviOOM0mul6O', 'user', 'ogFoBFMGFEG2')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS08, 密码: jJFNSTZjT7HS
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS08', '$2b$12$qUkJJCLJD.rI3wwN43Yy/eYOm3Z1MyxKp18ssDBBoZsw3vtfR2zCe', 'user', 'jJFNSTZjT7HS')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS09, 密码: sZDzA54#@RnD
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS09', '$2b$12$IjlAVmsPr01UCb.8yclTaON/2j2cz6Dnr6E1BMuI6WkHRFbEnIxQu', 'user', 'sZDzA54#@RnD')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS10, 密码: Q7zFw8yb2U@e
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS10', '$2b$12$Fr/TcJuQU525W4z9f1uDwe84UJwVNa3pgUuHrNETBtZsHGdUGGxmK', 'user', 'Q7zFw8yb2U@e')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS11, 密码: gtDVdmT2VgKs
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS11', '$2b$12$jDKL1WD3R2W2WSxmhet8GOXNzdelPlC1U58hPvXJpit.Gb2nAxv62', 'user', 'gtDVdmT2VgKs')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS12, 密码: @LW92odHWmnj
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS12', '$2b$12$jhaERNd3e45PMQPYWP5oT.LySf6V7/OZgzt8wCV4xRs1gx0iGx3gW', 'user', '@LW92odHWmnj')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS13, 密码: fm9BAKXDro4D
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS13', '$2b$12$rYhj0ZEUM4hnZQ8akt1UsuawcxUmV6auHsqrGuN4188db76zkNWta', 'user', 'fm9BAKXDro4D')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS14, 密码: 2f67DRPuA!#S
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS14', '$2b$12$3Uh/YSWYReIijJNX3ZqBg.v5x0Bp3kNZdB28loyFf88dc9Fs9YqOO', 'user', '2f67DRPuA!#S')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS15, 密码: 6TC%3c#Z$au6
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS15', '$2b$12$BZCxZkNi82osvj64cWe/YOciKvoxBN.oqD2yeEMAxR7V9iAKk7Kb6', 'user', '6TC%3c#Z$au6')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS16, 密码: 4wc5fxw3do@B
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS16', '$2b$12$kE76LTc/6czTJAtmFnUbyOMCvtr0A.89h31UKaGXw90X4THqAbgrm', 'user', '4wc5fxw3do@B')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS17, 密码: CzqKDez@rT5Q
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS17', '$2b$12$kpQeBuOYLuS7nHJffsgckeN90XfOZeE3lOmTxhDf0aL/TLiGlpdH2', 'user', 'CzqKDez@rT5Q')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS18, 密码: eexET$VHr932
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS18', '$2b$12$gav5H5aXPYz0bagQNZkvbOok01BFssJzR/yCeiHFg2r6EOv94CPYu', 'user', 'eexET$VHr932')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS19, 密码: oCNr4mzyHXNK
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS19', '$2b$12$EP/rryfvwR7XHx.rpOxVKe90nN6.h4UfOnV0iHYAgk4X.8FolMJdW', 'user', 'oCNr4mzyHXNK')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

-- 普通用户: GGYDS20, 密码: B%zbdijoQJRD
INSERT INTO users (username, password_hash, role, initial_password)
VALUES ('GGYDS20', '$2b$12$5tgWq/XHIj04YHgai1zInupdnfFasDtGvCBso.kkaBW5H2ftVFL.y', 'user', 'B%zbdijoQJRD')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  initial_password = EXCLUDED.initial_password,
  updated_at = CURRENT_TIMESTAMP;

