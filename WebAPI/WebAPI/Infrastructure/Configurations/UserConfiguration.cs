using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Email); //primarni kljuc tabele

            builder.Property(x => x.Email).HasMaxLength(50);

            builder.HasIndex(x => x.Email).IsUnique();   //email jedistveni podatak
            builder.Property(x => x.Name).HasMaxLength(30);
            builder.Property(x => x.Lastname).HasMaxLength(30);
            builder.Property(x => x.Address).HasMaxLength(30);
            builder.Property(x => x.Username).HasMaxLength(30);
        }
    }
}
